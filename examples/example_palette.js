// Example script to get palette image from Optris camera
const optris = require('../node-optris')

// Set you current config file path
xmlPath = "../config_file_windows.xml"
formatsPath = "../Formats.def"

// Load DLL 
sdkPath = "irDirectSDK/sdk/x64/libirimager.dll" // Define yout SDK path
optris.loadDLL(sdkPath)

console.log("Initialize USB communication")
optris.usb_init(xmlPath, formatsPath)

// Get w, h
let w, h = optris.get_palette_image_size()

while (true) {
    // palette image --> Buffer of size (w * h * 3)
    let palette_image = optris.get_palette_image(w, h)
    // Buffer can now be converted to Array or base64 string
}

// Handle CTRL-C to stop the script and terminate optris process correctly
process.on('SIGINT', () => {
    optris.terminate()
    process.exit()
})
