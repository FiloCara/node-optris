const ffi = require('ffi-napi');
const ref = require('ref-napi')
const refArray = require('ref-array-napi')

// Define useful datatypes
var ushortArray = refArray('ushort')
var intPointer = ref.refType('int')
var ucharArray = refArray('uchar')

// Initialize lib as a global var
var lib

const loadDLL = function(path) {
    try {
        lib = ffi.Library(path, {
            "evo_irimager_usb_init": [ "int", ["string", "string", "string"]],
            "evo_irimager_tcp_init": [ "int", ["string", "int"]],
            "evo_irimager_terminate": [ "int", []],
            "evo_irimager_get_thermal_image_size": [ "int", [intPointer, intPointer]],
            "evo_irimager_get_palette_image_size": [ "int", [intPointer, intPointer]],
            "evo_irimager_get_thermal_image" : ["int", [intPointer, intPointer, ushortArray]],
            "evo_irimager_get_palette_image" : ["int", [intPointer, intPointer, ucharArray]],
            "evo_irimager_get_thermal_palette_image": ["void", [intPointer, intPointer, ushortArray, intPointer, intPointer, ucharArray]],
            "evo_irimager_set_palette":["void", ["int"]],
            "evo_irimager_set_shutter_mode":["int", ["int"]],
            "evo_irimager_trigger_shutter_flag":["int", []],
            "evo_irimager_daemon_launch": ["int",[]],
            "evo_irimager_daemon_is_running": ["int",[]],
            "evo_irimager_daemon_kill": ["int",[]]
          });

    } catch (error) {
        throw new Error("Impossible to read the DLL")
    }
}

// @brief Initializes an IRImager instance connected to this computer via USB
// @param[in] xml_config path to xml config
// @param[in] formats_def path to Formats.def file. Set zero for standard value.
// @param[in] log_file path to log file. Set zero for standard value.
// @return 0 on success, -1 on error
  
// __IRDIRECTSDK_API__ int evo_irimager_usb_init(const char* xml_config, const char* formats_def, const char* log_file);

var usb_init = function(xml_config, formats_def, log_file) {
    let res = lib.evo_irimager_usb_init(xml_config, formats_def, log_file)
    if (res !== 0) {
        throw new Error("Impossible to establish a connection to the camera")
    }
};

// @brief Initializes the TCP connection to the daemon process (non-blocking)
// @param[in] IP address of the machine where the daemon process is running ("localhost" can be resolved)
// @param port Port of daemon, default 1337
// @return  error code: 0 on success, -1 on host not found (wrong IP, daemon not running), -2 on fatal error
//
// __IRDIRECTSDK_API__ int evo_irimager_tcp_init(const char* ip, int port);

var tcp_init = function(ip, port) {
    let res = lib.evo_irimager_tcp_init(ip, port)
    if (res !== 0) {
        throw new Error("Impossible to establish a connection to the camera (let have a look at the Node-Red logs for any further information")
    }
};

//
// @brief Disconnects the camera, either connected via USB or TCP
// @return 0 on success, -1 on error
//
// __IRDIRECTSDK_API__ int evo_irimager_terminate();
//

var terminate = function() {
    let res = lib.evo_irimager_terminate() 
    if (res !== 0) {
        throw new Error("The process was not terminated correctly")
    }
};

/**
 * @brief Accessor to image width and height
 * @param[out] w width
 * @param[out] h height
 * @return 0 on success, -1 on error
 
 __IRDIRECTSDK_API__ int evo_irimager_get_thermal_image_size(int* w, int* h);
*/

var get_thermal_image_size = function() {
    let w = ref.alloc('int');
    let h = ref.alloc('int');
    let res = lib.evo_irimager_get_thermal_image_size(w, h)
    if (res !== 0) {
        throw new Error("Impossible to compute the thermal image size, is the libirimager process initialized ?")
    }
    else {
        return [w.deref(), h.deref()]
    }
}

/**
 * @brief Accessor to width and height of false color coded palette image
 * @param[out] w width
 * @param[out] h height
 * @return 0 on success, -1 on error
 
 __IRDIRECTSDK_API__ int evo_irimager_get_palette_image_size(int* w, int* h);
 */

 var get_palette_image_size = function() {
    // Alloc two integers 
    let w = ref.alloc('int');
    let h = ref.alloc('int');
    let res = lib.evo_irimager_get_palette_image_size(w, h)
    if (res !== 0) {
        throw new Error("Impossible to compute the palette image size, is the libirimager process initialized ?")
    }
    else {
        return [w.deref(), h.deref()]
    }
}

/**
 * @brief Accessor to thermal image by reference
 * Conversion to temperature values are to be performed as follows:
 * t = ((double)data[x] - 1000.0) / 10.0;
 * @param[in] w image width
 * @param[in] h image height
 * @param[out] data pointer to unsigned short array allocate by the user (size of w * h)
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)

 __IRDIRECTSDK_API__ int evo_irimager_get_thermal_image(int* w, int* h, unsigned short* data);

 */

var get_thermal_image = function(w, h) {
    let arr = new ushortArray(w * h)
    w = ref.alloc('int', w);
    h = ref.alloc('int', h);
    let res  = lib.evo_irimager_get_thermal_image(w, h, arr)
    if (res !== 0) {
        throw new Error("Impossible to get the thermal frame")
    }
    else {
        return arr
    }
    
}

/**
 * @brief Accessor to an RGB palette image by reference
 * data format: unsigned char array (size 3 * w * h) r,g,b
 * @param[in] w image width
 * @param[in] h image height
 * @param[out] data pointer to unsigned char array allocate by the user (size of 3 * w * h)
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
 
 __IRDIRECTSDK_API__ int evo_irimager_get_palette_image(int* w, int* h, unsigned char* data);

 */

// TODO: to be tested
var get_palette_image = function(w, h) {
    let arr = new ucharArray(w * h * 3)
    w = ref.alloc('int', w);
    h = ref.alloc('int', h);
    let res  = lib.evo_irimager_get_thermal_image(w, h, arr)
    if (res !== 0) {
        throw new Error("Impossible to get the palette frame")
    }
    else {
        return arr
    }
}

/**
 * @brief Accessor to an RGB palette image and a thermal image by reference
 * @param[in] w_t width of thermal image
 * @param[in] h_t height of thermal image
 * @param[out] data_t data pointer to unsigned short array allocate by the user (size of w * h)
 * @param[in] w_p width of palette image (can differ from thermal image width due to striding)
 * @param[in] h_p height of palette image (can differ from thermal image height due to striding)
 * @param[out] data_p data pointer to unsigned char array allocate by the user (size of 3 * w * h)
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
 
 __IRDIRECTSDK_API__ int evo_irimager_get_thermal_palette_image(int w_t, int h_t, unsigned short* data_t, int w_p, int h_p, unsigned char* data_p );
*/

// TODO: to be tested
var get_thermal_palette_image = function(w, h) {
    // Allocate thermal varaibles 
    let thermal_arr = new ushortArray(w * h)
    let w_t = ref.alloc('int', w);
    let h_t = ref.alloc('int', h);
    // Allocate palette varaibles 
    let palette_arr = new ucharArray(w * h * 3)
    let w_p = ref.ref(w)
    let h_p = ref.ref(h)
    _  = evo_irimager_get_thermal_palette_image(w_t, h_t, thermal_arr, w_p, h_p, palette_arr)
    return {"thermal":thermal_arr, "palette":palette_arr}
}

/**
 * @brief sets palette format to daemon.
 * Defined in IRImager Direct-SDK, see
 * enum EnumOptrisColoringPalette{eAlarmBlue   = 1,
 *                                eAlarmBlueHi = 2,
 *                                eGrayBW      = 3,
 *                                eGrayWB      = 4,
 *                                eAlarmGreen  = 5,
 *                                eIron        = 6,
 *                                eIronHi      = 7,
 *                                eMedical     = 8,
 *                                eRainbow     = 9,
 *                                eRainbowHi   = 10,
 *                                eAlarmRed    = 11 };
 *
 * @param id palette id
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
 
 __IRDIRECTSDK_API__ int evo_irimager_set_palette(int id);
*/

const colorPalette = {
    eAlarmBlue   :1,
    eAlarmBlueHi :2,
    eGrayBW      :3,
    eGrayWB      :4,
    eAlarmGreen  :5,
    eIron        :6,
    eIronHi      :7,
    eMedical     :8,
    eRainbow     :9,
    eRainbowHi   :10,
    eAlarmRed    :11 
}

// TODO: to be tested
var set_palette = function(id) {
    let res = lib.evo_irimager_set_palette(id)
    return res
}

/**
 * @brief sets shutter flag control mode
 * @param mode 0 means manual control, 1 means automate
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
 
 __IRDIRECTSDK_API__ int evo_irimager_set_shutter_mode(int mode);
*/

// TODO: to be tested
var set_shutter_mode = function(mode) {
    let res = lib.evo_irimager_set_shutter_mode(mode)
    return res
}

 /**
  * @brief forces a shutter flag cycle
  * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
  
 __IRDIRECTSDK_API__ int evo_irimager_trigger_shutter_flag();
*/

// TODO: to be tested
var trigger_shutter_flag = function() {
    let res = lib.evo_irimager_trigger_shutter_flag()
    return res
}

/**
 * Launch TCP daemon
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)

 __IRDIRECTSDK_API__ int evo_irimager_daemon_launch();
 */

 // TODO: to be tested
 var daemon_launch = function() {
     let res = lib.evo_irimager_daemon_launch()
     return res
 }

 /**
  * Check whether daemon is already running
  * @return error code: 0 daemon is already active, -1 daemon is not started yet

 __IRDIRECTSDK_API__ int evo_irimager_daemon_is_running();
*/

// TODO: to be tested
var daemon_is_running = function() {
    let res = lib.evo_irimager_daemon_is_running()
    return res
}

 /**
  * Kill TCP daemon
  * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
  
 __IRDIRECTSDK_API__ int evo_irimager_daemon_kill();
*/

var daemon_kill = function() {
    let res = lib.evo_irimager_daemon_kill()
    return res
}


// Exports functions
module.exports.loadDLL = loadDLL
module.exports.usb_init = usb_init
module.exports.tcp_init = tcp_init
module.exports.terminate = terminate
module.exports.get_thermal_image_size = get_thermal_image_size
module.exports.get_palette_image_size = get_palette_image_size 
module.exports.get_thermal_image = get_thermal_image
module.exports.get_palette_image = get_palette_image
module.exports.get_thermal_palette_image = get_thermal_palette_image
module.exports.set_palette = set_palette
module.exports.colorPalette = colorPalette
module.exports.set_shutter_mode = set_shutter_mode
module.exports.trigger_shutter_flag = trigger_shutter_flag
module.exports.daemon_launch = daemon_launch
module.exports.daemon_is_running = daemon_is_running
module.exports.daemon_kill = daemon_kill

