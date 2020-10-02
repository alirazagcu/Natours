const crypto = require(`crypto`)
const {promisify} = require(`util`)
const User = require(`../models/userModel`)
const catchAsync = require(`../utils/catchAsync`)
const jwt = require(`jsonwebtoken`)
const AppError = require(`../utils/appError`)
const Email = require(`../utils/email`)



const signToken = id =>{
   return  jwt.sign({id}, "secret",{
        expiresIn: "90d"
    })
}

const createSendToken = (user, statusCode, res) =>{
    const token = signToken(user._id)
    const cookieOpotion = {
        expires: new Date(Date.now + 90 * 24*60*60*1000 ),
        httpOnly : true
    }
    if(process.env.NODE_ENV === `production`){
    cookieOpotion.secure = true}
    user.password = undefined
    res.cookie(`jwt`, token, cookieOpotion)

    res.status(statusCode).json({
        status : `success`,
        token,
        data : {
            user
        }
    })

}


exports.signUp =catchAsync( async(req, res, next) =>{
    const newUser = await User.create(req.body)
    const url = `${req.protocol}://${req.get('host')}/me`
    console.log(url)
    await new Email(newUser, url).sendWelcome()
    // const token = signToken(newUser._id)

    createSendToken(newUser,201,res)
    // res.status(201).json({
    //     status : `success`,
    //     token,
    //     data : {
    //         newUser
    //     }
    // })
})

exports.login = catchAsync(async(req, res, next) =>{
    const {email, password} = req.body
    //Check email or password is exist
    if(!email || !password){
       return next(new AppError(`please provide email and password`, 400))
    }
    //check user is exist and passowrd corret
    const user = await User.findOne({email}).select(`+password`)
    const correct =await user.correctPassword(password, user.password)
    if(!user || !correct){
       return next(new AppError(`Incorrect email or password`, 401))
    }
    //if everything oky send token to client
    createSendToken(user,200,res)
    // let token = signToken(user._id)
    // res.status(200).json({
    //     status : `success`,
    //     token,
    //     data : {
    //         user
    //     }
    // })
})

exports.protect = catchAsync(async(req, res, next)=>{
    //Get token and check its, here
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)){
         token = req.headers.authorization.split(` `)[1]
    }
    else if(req.cookies.jwt){
        token = req.cookies.jwt
    }

    if (!token) {
        return next(
          new AppError('You are not logged in! Please log in to get access.', 401)
        );
      }
    //verfication the token

    const decoded = await promisify(jwt.verify)(token, `secret`)
    //check if user still exist

    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
        return next(new AppError(`the user belonging to this token no longer exist`, 401))
    }
        //check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError(`User recently changed password! Please login agian`, 401))
    }
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser
    res.locals.user = freshUser;
    next()
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          'secret'
        );
  
        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
  
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };

exports.logout = (req, res) =>{
  res.cookie('jwt', 'loggedout',{
    expires : new Date(Date.now() + 10 * 1000),
    httpOnly : true
  })
  res.status(200).json({
    status : 'success'
  })
}

exports.restrictTo = (...roles) =>{
    return (req, res, next) =>{
        //roles
        if(!roles.includes(req.user.role)){
            return next(new AppError(`You do not have a permission to perform this action`))
        }
        next()
    }
}



exports.forgotPassword =catchAsync( async (req, res, next) =>{
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError(`there is no user with this email address`, 404))
    }
    //Generate resete token
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave : false})

    //Send it to user email
 
      // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
      try {
        const resetURL = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
  
        // await sendEmail({
        //   email: user.email, 
        //   subject: 'Your password reset token (valid for 10 min)',
        //   message
        // });
        await new Email(user,  resetURL).sendPasswordReset()
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }

})
exports.resetPassword = catchAsync (async(req, res, next) =>{
    //Get user based token
    const hashedToken = crypto.createHash(`sha256`).update(req.params.token).digest(`hex`)
   const user  = await User.findOne(
       {passwordResetToken : hashedToken,
        passwordResetExpires :{$gt : Date.now()}
     }) 
    //if token has not expired , and there is a user set the new password
    if(!user){
        return next(new AppError(`Token is invalid or expired`, 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken  = undefined
    user.passwordResetExpires = undefined
    await user.save()
    //update changePasswordAt property of the user
    //Log the user in send JWT
    createSendToken(user,200,res)
//     const token = signToken(user._id)
//     res.status(200).json({
//         status: `success`,
//         token
//     })
})

exports.updatePassword =catchAsync( async(req, res, next) =>{
    //Get user from collection
    const user = await User.findById(req.user.id).select(`+password`)
    //check if posted current password
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError(`Your Current password is wrong`, 401))
    }
    //if so update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    //log user in and send jwt
    createSendToken(user,200,res)
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status : `success`,
    //     token,
    //     data :{
    //         user
    //     }
    // })
})