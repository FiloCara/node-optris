const ffi = require('ffi-napi');
const ref = require('ref-napi')
const refArray = require('ref-array-napi')

let DLLPATH = "irDirectSDK/sdk/x64/libirimager.dll"

const setDLLPath = function(path) {
    DLLPATH = path
}

var uchar = ref.types.uchar
var ushortArray = refArray('ushort')
var intPointer = ref.refType('int')
var ucharArray = refArray('uchar')


var lib = ffi.Library(DLLPATH, {
    "evo_irimager_usb_init": [ "int", ["string", "string", "string"]],
    "evo_irimager_tcp_init": [ "void", ["string", "int"]],
    "evo_irimager_terminate": [ "int", []],
    "evo_irimager_get_thermal_image_size": [ "int", [intPointer, intPointer]],
    "evo_irimager_get_palette_image_size": [ "int", [intPointer, intPointer]],
    "evo_irimager_get_thermal_image" : ["int", [intPointer, intPointer, ushortArray]],
    "evo_irimager_get_palette_image" : ["int", [intPointer, intPointer, ucharArray]],
    "evo_irimager_get_thermal_palette_image": ["void", [intPointer, intPointer, ushortArray, intPointer, intPointer, ucharArray]],
    "evo_irimager_set_palette":["void", ["int"]]
  });

// @brief Initializes an IRImager instance connected to this computer via USB
// @param[in] xml_config path to xml config
// @param[in] formats_def path to Formats.def file. Set zero for standard value.
// @param[in] log_file path to log file. Set zero for standard value.
// @return 0 on success, -1 on error
  
// __IRDIRECTSDK_API__ int evo_irimager_usb_init(const char* xml_config, const char* formats_def, const char* log_file);

var usb_init = function(xml_config, formats_def, log_file) {
    let errorCode = lib.evo_irimager_usb_init(xml_config, formats_def, log_file)
    return errorCode
};

// @brief Initializes the TCP connection to the daemon process (non-blocking)
// @param[in] IP address of the machine where the daemon process is running ("localhost" can be resolved)
// @param port Port of daemon, default 1337
// @return  error code: 0 on success, -1 on host not found (wrong IP, daemon not running), -2 on fatal error
//
// __IRDIRECTSDK_API__ int evo_irimager_tcp_init(const char* ip, int port);

var tcp_init = function(ip, port) {
    let errorCode = lib.evo_irimager_tcp_init(ip, port)
    return errorCode
};

//
// @brief Disconnects the camera, either connected via USB or TCP
// @return 0 on success, -1 on error
//
// __IRDIRECTSDK_API__ int evo_irimager_terminate();
//

var terminate = function() {
    let errorCode = lib.evo_irimager_terminate() 
    return errorCode
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
    _ = lib.evo_irimager_get_thermal_image_size(w, h)
    return [w, h]
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
    _ = lib.evo_irimager_get_palette_image_size(w, h)
    return [w, h]
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
    _  = lib.evo_irimager_get_thermal_image(w, h, arr)
    return arr
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
    let w = ref.ref(w)
    let h = ref.ref(h)
    _  = lib.evo_irimager_get_thermal_image(w, h, arr)
    return arr
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

var set_palette = function(id) {
    _ = lib.evo_irimager_set_palette(id)
}

/**
 * @brief sets shutter flag control mode
 * @param mode 0 means manual control, 1 means automode
 * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
 
 __IRDIRECTSDK_API__ int evo_irimager_set_shutter_mode(int mode);

*/

 /**
  * @brief forces a shutter flag cycle
  * @return error code: 0 on success, -1 on error, -2 on fatal error (only TCP connection)
  
 __IRDIRECTSDK_API__ int evo_irimager_trigger_shutter_flag();

*/

// Exports functions
exports.usb_init = usb_init
exports.tcp_init = tcp_init
exports.terminate = terminate
exports.get_thermal_image_size = get_thermal_image_size
exports.get_palette_image_size = get_palette_image_size 
exports.get_thermal_image = get_thermal_image
exports.get_palette_image = get_palette_image
exports.set_palette = set_palette