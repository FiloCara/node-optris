// Example script to get palette image from Optris camera
const optris = require('../node-optris')

// Set you current config file path
xmlPath = "../config_file_windows.xml"
formatsPath = "../Formats.def"

// Load DLL 
sdkPath = "irDirectSDK/sdk/x64/libirimager.dll" // Define yout SDK path
optris.loadDLL(sdkPath)

optris.usb_init(xmlPath, formatsPath)

// Get w, h
let w, h = optris.get_thermal_image_size()

while (true) {
    // thermal image --> Buffer of size (w * h)
    let thermal_image = optris.get_thermal_image(w, h)
    // Buffer can now be converted to Array or base64 string

}

process.on("SIGINT", function() {
    optris.terminate()
    process.exit()
    })