const cv = require('opencv4nodejs')

let arr = Buffer.alloc(640*480)

for (let i=0; i < arr.length; i++) {
    arr[i] = Math.round(Math.random() * 100) 
}

let mat = new cv.Mat(arr, 480, 640, cv.CV_16UC1)

mat.findContours()

console.log(mat)



// console.time("test")
// // let float_arr = Array.from(arr)
// let base64 = arr.toString('base64')
// console.timeEnd("test")
// // console.log(float_arr)


