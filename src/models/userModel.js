const crypto = require(`crypto`)
const mongoose = require(`mongoose`)
const validator = require(`validator`)
const Schema = mongoose.Schema
const bcryptjs = require(`bcryptjs`)
const userSchema = new Schema(
    {
        name:{
            type: String,
            required : [true, `plz tell us your name`]
        },
        email : {
            type : String,
            required : [true, `plz provide your email `],
            unique : true,
            lowercase : true,
            validate : [validator.isEmail, `please provide a valid email`]
        },
        photo : {
            type: String,
            default : 'default.jpg'
        },
        role : {
            type : String,
            enum : [`user`,`guide`,`lead-guide`, `admin`],
            default : `user`
        },
        password :{
            type : String,
            required : [true, `plz provide a password`],
            minlength : 8,
            select : false
        },
        passwordConfirm :{
            type : String,
            required : [true, `plz confirm your password`],
            validate :{
                validator: function(el){
                    return el ===this.password
                },
                message : `password are not the same!`
            }
        },
        passwordChangedAt : Date,
        passwordResetToken : String,
        passwordResetExpires : Date,
        active : {
            type : Boolean,
            default : true,
            select : false
        }
    }
)

userSchema.pre(`save`, async function(next){
    if(!this.isModified(`password`) || this.isNew){
        return next()
    }
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(`save`, async function(next) {
    if(!this.isModified(`password`)){
        return next()
    }
    //Hashing the passowrd
    this.password = await bcryptjs.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()

})
userSchema.pre(/^find/, function(next) {
    this.find({active :{$ne: false}})
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcryptjs.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp =parseInt( this.passwordChangedAt.getTime()/1000, 10)
        // console.log(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString(`hex`)
    this.passwordResetToken =
    crypto
    .createHash(`sha256`)
    .update(resetToken)
    .digest(`hex`)
    console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10*60*1000
    return resetToken

}
module.exports = mongoose.model(`User`, userSchema)