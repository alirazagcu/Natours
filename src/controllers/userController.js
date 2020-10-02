const fs = require(`fs`)
const multer = require('multer')
const sharp = require('sharp')
const User = require(`../models/userModel`)
const catchAsync = require(`../utils/catchAsync`)
const AppError = require(`../utils/appError`)
const factory = require(`./handlerFactory`)
const users = JSON.parse(fs.readFileSync(`C:/Users/araza/Desktop/Natours/dev-data/data/users.json`))

// const multerStorage = multer.diskStorage({
//     destination : (req, file, cb) =>{
//         cb(null, 'public/img/users')
//     },

//     filename : (req, file, cb) =>{
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${Date.now()}.${ext}`)
//     }
// })
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }
    else{
        cb(new AppError('Not a image please upload the  image', 400), false )
    }
}

// const upload = multer({dest: 'public/img/users'})

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto =catchAsync ( async (req, res, next) =>{
    if(!req.file){
        return next()
    }
    else{
        req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
       await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality : 90})
        .toFile(`public/img/users/${req.file.filename}`)
        next()
    }
} )
const filterObj = (obj, ...allowFields) =>{
    const newObj = {}
    Object.keys(obj).forEach(el =>{
        if(allowFields.includes(el)){
            newObj[el] = obj[el]
        }
    })
    return newObj
}

exports.getMe = (req, res, next) =>{
    req.params.id = req.user.id
    next()
}

exports.updateMe =catchAsync( async (req, res, next) =>{
    //Create a error if user update the password
    console.log(req.file)
    // req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    // console.log(req.file.filename)
    // console.log(req.body)
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError(`this route is not password update please use /updateMyPassword`, 400))
    }
    const filterBody = filterObj(req.body, `name`, `email`)
    if(req.file){
        filterBody.photo = req.file.filename 
    }
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new : true,
        runValidators : true
    })
    res.status(200).json({
        status : `success`,
        data : {
            updateUser
        }
    })
})

exports.deleteMe = catchAsync(async(req, res, next)=>{
    await User.findByIdAndDelete(req.user.id, {active: false})
    res.status(204).json({
        status : `success`
    })
})



exports.getAllUser = factory.getAll(User)
// catchAsync( async (req, res) =>{
//         const users = await User.find()
//         res.status(200).json(
//             {
//                 status : 'Success',
//                 result : users.length,
//                 data : {
//                     users
//                 }
//             }
//         )


// })

exports.createUser = factory.createOne(User)
// (req, res) =>{

//     const newId = users[users.length - 1].id + 1;
//     const newUser = Object.assign({
//         id : newId,
//     }, req.body)
//     users.push(newUser)

//     fs.writeFile(
//         `C:/Users/araza/Desktop/Natours/dev-data/data/users.json`,
//         JSON.stringify(users),
//         err =>{
//             res.status(201).json({
//                 status : 'Success',
//                 data :{
//                     users : newUser
//                 }
//             })
//         }
//     )

// }

exports.getUser = factory.getOne(User)
//  (req, res) =>{

//     console.log(req.params)
//     const id = req.params.id * 1;
//     const user = users.find(el => el.id === id)

//     // if(id > tours.length)
//     if(!user)
//     {
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid id'
//         })
        
//     }

//     res.status(200).json({
//         status : 'Success',
//         data : {
//             user
//         }
//     })
// }

exports.updateUser = factory.updateOne(User)
// (req, res) =>{
//     if(req.params.id *1 >users.length){
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid id'
//         })
//     }
//     res.status(200).json({
//         status : 'status',
//         data : {
//             user : '<Updated user here.....'
//         }
//     })
// }


exports.deleteUser = factory.deleteOne(User)
//  (req, res) =>{
//     if(req.params.id *1 >users.length){
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid id'
//         })
//     }
//     res.status(204).json({
//         status : 'status',
//         data : null
//     })
// }