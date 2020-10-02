const bookingContoller = require(`../controllers/bookingController`)
const authControoler = require(`../controllers/authController`)
const express = require(`express`)
const factory = require(`../controllers/handlerFactory`)

const router = express.Router()
router.use(authControoler.protect)
router.get('/checkout-session/:tourID', bookingContoller.getCheckoutSession)
router.use(authControoler.restrictTo('admin','lead-guide'))
router
.route('/')
.get(bookingContoller.getAllBooking)
.post(bookingContoller.createBooking)

router
.route('/:id')
.get(bookingContoller.getBooking)
.patch(bookingContoller.updateBooking)
.delete(bookingContoller.deleteBooking)
    

module.exports = router