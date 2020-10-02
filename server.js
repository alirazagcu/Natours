const app = require(`./app`)
const dotenv = require(`dotenv`)
const mongoose = require(`mongoose`)
const Tour = require(`./src/models/tourModel`)

mongoose.connect('mongodb://localhost:27017/Natours-app', {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(()=>{
    console.log('connected to mongodb databse')
}).catch((e) =>{
    console.log('Error occured during connectionn ...... ',e)
})

dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000 
app.listen(port, () =>{
    console.log(`app is runnig on port ${port} .....`)
})