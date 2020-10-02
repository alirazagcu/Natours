const reviewController = require(`../controllers/reviewController`)
const authControoler = require(`../controllers/authController`)
const express = require(`express`)
const factory = require(`../controllers/handlerFactory`)
const router = express.Router({mergeParams : true})

//GET tour/234adfggggg34/reviews
//POST tour/234dsfgdg34/reviews
//POST tour/reviews
router.use(authControoler.protect)
router.route(`/`)
.get( reviewController.getAllReviews)
// .post(authControoler.protect, authControoler.restrictTo(`user`), reviewController.createReview)
.post(
    authControoler.restrictTo(`user`),
    reviewController.setTourUserId,
    reviewController.createReview
)
router.route('/:id')
.delete(authControoler.restrictTo(`user`, `admin`) ,reviewController.deleteReview)
.patch(authControoler.restrictTo(`user`, `admin`) ,reviewController.updateReview)
.get(reviewController.getReview)

module.exports = router