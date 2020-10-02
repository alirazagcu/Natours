const fs = require(`fs`)
const sharp = require('sharp')
const multer = require('multer')
const Tour = require(`../models/tourModel`)
const APIFeatures = require(`../utils/apiFeatures`)
const catchAsync = require(`../utils/catchAsync`)
const AppError = require(`../utils/appError`)
const factory = require(`./handlerFactory`)
const tours = JSON.parse(fs.readFileSync(`C:/Users/araza/Desktop/Natours/dev-data/data/tours-simple.json`))

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

exports.uploadTourPhoto = upload.fields([
  {name : 'imageCover', maxCount: 1},
  {name : 'images', maxCount : 3}
])

exports.resizeTourImages =catchAsync(async  (req, res, next) =>{
  // console.log(req.files )
  if(!req.files.imageCover || !req.files.images){
    return next()
  }
   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({quality : 90})
  .toFile(`public/img/tours/${req.body.imageCover}`)

  
  req.body.images = []
  await Promise.all(
  req.files.images.map( async(file, i) =>{
    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}-cover.jpeg`
    await sharp(file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality : 90})
    .toFile(`public/img/tours/${filename}`)
    req.body.images.push(filename)
  })
   )
   console.log()
  next()
})


// upload.array('images', 5)

// exports.checkId = (req, res, next, val) =>{
//     console.log(`Tour Id is ${val}`)
//     if(req.params.id *1 >tours.length){
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid id'
//         })
//     }

//     next()
// }

// exports.checkBody = (req, res, next) =>{
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status :  `fail`,
//             message : `Missing name or price`
//         })
//     }
//     next()
// }

//Middleware function to getting top 5 cheap tour
exports.aliasTopTour = (req,res, next) =>{
    req.query.limit = `5`
    req.query.sort = `-ratingAverage,price`
    req.query.fields = `name,price,ratingAverage`
    next()
}




exports.getAllTour = factory.getAll(Tour)
// catchAsync( async (req, res, next) =>{

//     // try{
//         //FILTERINg
//         // const queryObj = {...req.query}
//         // const excludeFields = [`page`, `sort`, `limit`, `fields`]
//         // excludeFields.forEach(el => delete queryObj[el])

//         // //Advance Filtering
//         // let queryStr = JSON.stringify(queryObj)
//         // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`)
//         // // console.log(JSON.parse(queryStr))
//         // // const tours = await Tour.find(queryObj)

//         // //Query
//         // let query = Tour.find(JSON.parse(queryStr))
//         //Sorting
//         // if(req.query.sort){
//         //     const sortBy = req.query.sort.split(`,`).join(` `)
//         //     console.log(sortBy)
//         //     query = query.sort(sortBy)
//         // }else{
//         //     query = query.sort(`-createdAt`)
//         // }
//         //Field Limitation
//         // if(req.query.fields){
//         //     const fields = req.query.fields.split(`,`).join(` `)
//         //     query = query.select(fields)
//         // }
//         // else{
//         //     query = query.select(`-__v`)
//         // }
//         // if(req.query.limit){
//         //     query = query.limit(Number(req.query.limit))
//         // }
//         //Pagination
//         // const page = req.query.page *1 || 1
//         // const limit = req.query.limit *1 ||100
//         // const skip = (page -1) * limit
//         // query = query.skip(skip).limit(limit)
//         // if(req.query.page){
//         //     const  numTours = await Tour.countDocuments()
//         //     if(skip > numTours){
//         //         throw new Error(`this page does not exist`)
//         //     }
//         // }
      
//         //Execute Query
//         const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate()
//         const tours = await features.query
//         // const tours = await Tour.find(req.query)
//         // const tours = await Tour.find({
//         //     duration : req.query.duration,
//         //     difficulty : req.query.difficulty
//         // })
//         res.status(200).json({
//             status : `success`,
//             result : tours.length,
//             data : {
//                 tours
//             }
//         })
//     // }catch(err){
//     //     res.status(400).json({
//     //         status : `fail`,
//     //         message : err
//     //     }).com.com.com.com.com.com.com
//     // }

// })

exports.createTour = factory.createOne(Tour)
//  catchAsync( async (req, res, next) =>{
//     // try {
//     const newTour = await Tour.create(req.body)
    
//     res.status(201).json({
//         status : `success`,
//         data : {
//             tour : newTour
//         }
//     })
// // }catch(err){
// //     res.status(400).json({
// //         status : `fail`,
// //         message : err    })
// // }




//     // const newId = tours[tours.length - 1].id + 1;
//     // const newTour = Object.assign({
//     //     id : newId,
//     // }, req.body)
//     // tours.push(newTour)

//     // fs.writeFile(
//     //     `C:/Users/araza/Desktop/Natours/dev-data/data/tours-simple.json`,
//     //     JSON.stringify(tours),
//     //     err =>{
//     //         res.status(201).json({
//     //             status : 'Success',
//     //             data :{
//     //                 tour : newTour
//     //             }
//     //         })
//     //     }
//     // )

// })

exports.getTour = factory.getOne(Tour, {path : `reviews`})
// catchAsync( async (req, res, next) =>{
//     // try {
//         const tour = await Tour.findById(req.params.id).populate(`reviews`)

//         // Tour.findOne({_id : req.params.id})
//         if (!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//           }
//         res.status(200).json({
//             status : `success`,
//             data  : {
//                 tour
//             }
//         })
//     // } catch (error) {
//     //     res.status(400).json({
//     //         status : `fail`,
//     //         message  : `Invalid id`
//     //     })        
//     // }

//     // console.log(req.params)
//     // const id = req.params.id * 1;
//     // const tour = tours.find(el => el.id === id)

//     // // if(id > tours.length)
//     // if(!tour)
//     // {
//     //     return res.status(404).json({
//     //         status : 'fail',
//     //         message : 'Invalid id'
//     //     })
        
//     // }

//     // res.status(200).json({
//     //     status : 'Success',
//     //     data : {
//     //         tour
//     //     }
//     // })
// })

exports.updateTour = factory.updateOne(Tour)
//  catchAsync( async (req, res) =>{

//     // try {
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
//             new : true,
//             runValidators : true
//         })
//         if (!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//           }
//         res.status(200).json({
//             status :`success`,
//             data : {
//                 tour : `<Updated tour .....`
//             }
//         })

//     // } catch (error) {
//     //     res.status(400).json({
//     //         status : `fail`,
//     //         message : err
//     //     })
        
//     // }
//     // // if(req.params.id *1 >tours.length){
//     // //     return res.status(404).json({
//     // //         status : 'fail',
//     // //         message : 'Invalid id'
//     // //     })
//     // // }
//     // res.status(200).json({
//     //     status : 'status',
//     //     data : {
//     //         tour : '<Updated tour here.....'
//     //     }
//     // })
// })


exports.deleteTour = factory.deleteOne(Tour)

// exports.deleteTour = catchAsync( async (req, res) =>{
//     // try {
//         const tour = await Tour.findByIdAndDelete(req.params.id)
//         if (!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//           }
//         res.status(200).json({
//             status : `Sucess`,
//             data : {
//                 tour
//             }
//         })
//     // } catch (error) 
//     // {
//     // res.status(400).json({
//     //     status : `fail`,
//     //     message : err
//     // })    
//     // }

//     // // if(req.params.id *1 >tours.length){
//     // //     return res.status(404).json({
//     // //         status : 'fail',
//     // //         message : 'Invalid id'
//     // //     })
//     // // }
//     // res.status(204).json({
//     //     status : 'status',
//     //     data : null
//     // })
// })

exports.getTourStats =catchAsync( async (req, res) => {
    // try {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $sort: { avgPrice: 1 }
        },
        {
          $match: { _id: { $ne: 'EASY' } }
        }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
    // } catch (err) {
    //   res.status(404).json({
    //     status: 'fail',
    //     message: err
    //   });
    // }
  });
  
  exports.getMonthlyPlan = catchAsync( async (req, res) =>{
//    try {
       const year = req.params.year * 1
       const plan = await Tour.aggregate([
           {
               $unwind: `$startDates`
           },
           {
               $match : {
                   startDates : {
                       $gte : new Date(`${year}-01-01`),
                       $lte : new Date(`${year}-12-31`)
                   }
               }
           },
           {
               $group : {
                   _id:{$month : `$startDates`},
                   numTourStarts : {$sum : 1},
                   tour  : {$push  : `$name`}
               }
           },
           {
               $addFields : {month : `$_id`}
           },
           {
               $project: {
                   _id : 0 
               }
           },
           {
               $sort : {numTours: 1}
           },
           {
               $limit : 6
           }
       ])
       res.status(200).json({
           stats :`success`,
           data  : {
               plan
           }
       })
//    } catch (err) {
//        res.status(404).json({
//            status : `fail`,
//            message: err
//        })
//    }   
  })
//tours?distance=233&center=-48, 45&unit=mi
//tours/233/center/42,46/unit/mi
  exports.getTourWithin = catchAsync(async (req, res, next) =>{
    const {distance, latlng, unit} = req.params
    const radius = unit ==='mi'? distance/3963.2 : distance/6378.1
    const [lat, lng] = latlng.split(',')
    if(!lat || !lng){
      next(new AppError( 'please provide tha latitude and longitude in the lat, lng format', 400))
    }
    const tour = await Tour.find({startLocation: { $geoWithin:{ $centerSphere :[[lng, lat], radius]}}})
    console.log(distance, lat, lng, unit)
    res.status(200).json({
      stats : 'success',
      result : tour.length,
      data : {
        data: tour
      }
    })
  }
  )

  exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });