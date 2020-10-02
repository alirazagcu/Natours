const mongoose = require(`mongoose`)
const fs = require(`fs`)
const Tour = require(`./../../src/models/tourModel`)
const User = require(`./../../src/models/userModel`)
const Review = require('./../../src/models/reviewModel')

mongoose.connect('mongodb://localhost:27017/Natours-app', {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(()=>{
    console.log('connected to mongodb databse')
}).catch((e) =>{
    console.log('Error occured during connectionn ...... ',e)
})

const tour =JSON.parse(fs.readFileSync(`C:/Users/araza/Desktop/Natours/dev-data/data/tours.json`))
const users =JSON.parse(fs.readFileSync(`C:/Users/araza/Desktop/Natours/dev-data/data/users.json`))
const reviews =JSON.parse(fs.readFileSync(`C:/Users/araza/Desktop/Natours/dev-data/data/reviews.json`))


const importData = async () =>{
    try {
        await User.create(users,{validateBeforeSave : false})
        await Review.create(reviews)
        await Tour.create(tour)
        console.log(`data successfullly loaded`)

    } catch (err) {
        console.log(err)
    }
    process.exit()
}


const deleteData = async () =>{
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log(`data successfullly deleted`)

    } catch (err) {
        console.log(err)
    }
    process.exit()
}

if(process.argv[2] == `--import`){
    importData()
}
else if(process.argv[2] == `--delete`){
deleteData()
}

