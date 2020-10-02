const express = require(`express`)
const router = express.Router()
const tourController  = require(`../controllers/tourController`)
const authController  = require(`../controllers/authController`)
const reviewController = require(`../controllers/reviewController`)
const reviewRouter = require(`../routers/review`)
// router.param(`id`, tourController.checkId)


//GET tour/234sfd23/reviews
//POST tour/23sffse/reviews
//GET tour/dfsf332432/reviews/e2332cdsff

// router.route(`/:tourId/reviews`)
// .post(authController.protect,
//      authController.restrictTo(`user`),
//      reviewController.createReview
//      )

router.use(`/:tourId/reviews`, reviewRouter)
router.route(`/top-5-cheap`).get(tourController.aliasTopTour, tourController.getAllTour)
router.route(`/tour-stats`)
.get(tourController.getTourStats)

router.route(`/monthly-plan/:year`)
.get(authController.protect, authController.restrictTo(`admin`, `lead-guide`, `guide`) ,tourController.getMonthlyPlan)


router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getTourWithin) 
router.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances)
//tours?distance=233&center=-48, 45&unit=mi


router
.route(`/`)
.get(tourController.getAllTour)
.post(authController.protect, authController.restrictTo(`admin`, `lead-guide`) ,tourController.createTour)
// .post(tourController.checkBody ,tourController.createTour)



router
.route(`/:id`)
.get(tourController.getTour)
.patch(authController.protect, 
    authController.restrictTo(`admin`, `lead-guide`),
    tourController.uploadTourPhoto,
     tourController.resizeTourImages ,
     tourController.updateTour)
.delete(authController.protect, authController.restrictTo(`admin`,`lead-guide`),tourController.deleteTour)

//GET tour/234sfd23/reviews
//POST tour/23sffse/reviews
//GET tour/dfsf332432/reviews/e2332cdsff

// router.route(`/:tourId/reviews`)
// .post(authController.protect,
//      authController.restrictTo(`user`),
//      reviewController.createReview
//      )

module.exports = router