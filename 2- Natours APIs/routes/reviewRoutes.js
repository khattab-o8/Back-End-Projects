// MODULES:
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//-------------Here-------------//

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/') // -> /api/v1/reviews *_OR_* /api/v1/tours/:tourId/reviews
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIDs,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
