const path = require('path')
const express = require(`express`)
const morgan = require(`morgan`)
const tourRouter = require(`./src/routers/tour`)
const userRouter = require(`./src/routers/user`)
const reviewRouter = require(`./src/routers/review`)
const bookingRouter = require('./src/routers/booking')
const Tour = require(`./src/models/tourModel`)
const AppError = require(`./src/utils/appError`)
const errorController = require(`./src/controllers/errorontroller`)
const rateLimit = require(`express-rate-limit`)
const helmet = require(`helmet`)
const mongoSanitize = require(`express-mongo-sanitize`)
const viewRouter = require('./src/routers/view')
const xss = require(`xss`)
const hpp = require(`hpp`)
const cookieParser = require('cookie-parser')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname,'public')))

const limiter = rateLimit({
    max : 100,
    windowMs : 60 * 60 * 1000,
    message : `Too many request from this IP, please try again in an hour`
})
app.use(`/api`, limiter)

app.use(helmet())
app.use(mongoSanitize())
// app.use(xss)

app.use(hpp({
    whitelist : [
        `duration`,
        `ratingsQuantity`,
        `ratingsAverage`,
        `maxGroupSize`,
        `difficulty`,
        `price`
    ]
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended : true}))
//Data sanitization againt NoSQL query injection
//Data sanitization against XSS

app.use(morgan(`dev`))




//MIDDLEWARE
// console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }


// app.use((req, res, next) =>{
//     console.log(`Hello from the middle ware function`)
//     next()
// })

app.use((req, res, next) =>{
    req.requestTime = new Date().toISOString()
    // console.log(req.cookies)
    next()
})

// app.get('/', (req, res) =>{
//     res.status(200).render('base',{
//         tour : 'The forest hiker',
//     })
// })

// app.get('/overview', (req, res) =>{
//         res.status(200).render('overview',{
//             title: 'The forest hiker tour'
//         })
// })

// app.get('/tour', (req, res) =>{
//     res.status(200).render('tour', {
//         title : 'The forest hiker tour'
//     })
// })
app.use('/', viewRouter)
app.use(`/api/v1/tours`, tourRouter)
app.use(`/api/v1/users`, userRouter)
app.use(`/api/v1/reviews`, reviewRouter)
app.use(`/api/v1/bookings`, bookingRouter)

app.all(`*`, (req, res,next) =>{
    // res.status(404).json({
    //     status : `fail`,
    //     message : `Can not find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`Can not find ${req.originalUrl} on this server`)
    // err.status = `fail`
    // err.statusCode = 404
    // next(err)
    next(new AppError(`Can not find ${req.originalUrl} on this server`, 404))
})



// app.use((err, req, res, next)=>{
//     err.statusCode = err.statusCode || 500
//     err.status = err.status || `Error`
//     res.status(err.statusCode).json({
//         status : err.status,
//         message : err.message 
//     })
// })
app.use(errorController)
module.exports = app




















// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

// const getAllTour = (req, res) =>{

//     console.log(req.requestTime)
    
//     res.status(200).json(


//         {

//             status : 'Success',
//             result : tours.length,
//             data : {
//                 tours
//             }
//         }
//     )

// }
// const creareTour = (req, res) =>{

//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({
//         id : newId,
//     }, req.body)
//     tours.push(newTour)

//     fs.writeFile(
//         `${__dirname}/dev-data/data/tours-simple.json`,
//         JSON.stringify(tours),
//         err =>{
//             res.status(201).json({
//                 status : 'Success',
//                 data :{
//                     tours : newTour
//                 }
//             })
//         }
//     )
//     res.status(200).json(


//         {

//             status : 'Success',
//             result : tours.length,
//             // data : {
//             //     tours
//             // }
//         }
//     )

// }

// const getTour =  (req, res) =>{

//     console.log(req.params)
//     const id = req.params.id * 1;
//     const tour = tours.find(el => el.id === id)

//     // if(id > tours.length)
//     if(!tour)
//     {
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid id'
//         })
        
//     }

//     res.status(200).json({
//         status : 'Success',
//         data : {
//             tour
//         }
//     })
// }

// const updateTour = (req, res) =>{
//     if(req.params.id *1 >tours.length){
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid id'
//         })
//     }
//     res.status(200).json({
//         status : 'status',
//         data : {
//             tour : '<Updated tour here.....'
//         }
//     })
// }

// const deleteTour =  (req, res) =>{
//     if(req.params.id *1 >tours.length){
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

// app
// .route(`/api/v1/tours`)
// .get(getAllTour)
// .post(creareTour)
// app
// .route(`/api/v1/tours/:id`)
// .get(getTour)
// .patch(updateTour)
// .delete(deleteTour)






