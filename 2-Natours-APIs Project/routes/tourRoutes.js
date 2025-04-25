// MODULES:
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
//-------------Here-------------//
// Routes:
const router = express.Router(); // Middleware

// Outside Param Middleware (ID Validation)
// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter); // Mounting A Router

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createNewTour
  );

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within?distance=230&center=37.745727,-122.440343&unit=mi

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWihin);

router.route('/diatances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
