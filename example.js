// Example script to test the node-optris module

// const optris = require('./direct_binding')
const optris = require('node-optris')

xmlPath = "config_file_windows.xml"

console.log("Initialize USB communication")
console.log(optris.usb_init(xmlPath, formatsPath))

// Get w, h
let dims = optris.get_palette_image_size()

while (true) {
    let data = optris.get_palette_image(w, h)
    console.log(data)
}

optris.terminate()



// i = 0
// while (i < 10000) {
    // Get thermal frame
// let data = optris.get_thermal_image(dims[0], dims[1])
// }

console.log(optris.terminate())