# node-optris

This module provides a NodeJS binding to the Evocortex Libirimager SDK. The direct binding allows to get images from Optris cameras using NodeJS. For any further information about the SDK and the functions available in the API please refers to the [Evocortex documentation](http://documentation.evocortex.com/libirimager2/html/).

**Under development**

## Installation 

* Download the irDirectSDK from the [Evocortex website](https://evocortex.org/downloads/)
* Install the package: `npm install https://github.com/FiloCara/node-optris.git`

## Implemented functions

|direct binding name|node-optris name|description|
|-------------------|----------------|-----------|
|evo_irimager_usb_init|usb_init      ||
|evo_irimager_usb_init|tcp_init      ||
|evo_irimager_terminate |terminate ||
|evo_irimager_get_thermal_image_size|get_thermal_image_size||
|evo_irimager_get_palette_image_size|get_palette_image_size|| 
|evo_irimager_get_thermal_image | get_thermal_image ||
|evo_irimager_get_palette_image | get_palette_image
|evo_irimager_set_palette| set_palette ||

More information available in the docstrings of the `node-optris.js` file.

## Examples

### Get thermal images

```javascript
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
```

### Get palette images

```javascript
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
```