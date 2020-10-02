const express  = require(`express`)
const userController = require(`../controllers/userController`)
const authController = require(`../controllers/authController`)

const router = express.Router()

router.post(`/signup`, authController.signUp)
router.post(`/login`, authController.login)
router.get('/logout', authController.logout)
router.post(`/forgotPassword`, authController.forgotPassword)
router.patch(`/resetPassword/:token`, authController.resetPassword)
router.patch(`/updateMyPassword`, authController.protect, authController.updatePassword)
router.patch(`/updateMe`,
authController.protect,
userController.uploadUserPhoto ,
 userController.resizeUserPhoto, 
   userController.updateMe)
router.delete(`/deleteMe`,  userController.deleteMe)
router.get('/me', authController.protect, userController.getMe,userController.getUser)
router.use(authController.protect)
router.use(authController.restrictTo(`admin`))
router
.route(`/`)
.get(userController.getAllUser)
.post(userController.createUser)

router
.route(`/:id`)
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)



module.exports = router
