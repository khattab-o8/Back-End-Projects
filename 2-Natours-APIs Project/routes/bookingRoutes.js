// MODULES:
const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

//-------------Here-------------//

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourID', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

module.exports = router;
