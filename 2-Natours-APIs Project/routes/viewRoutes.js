// MODULES:
const express = require('express');
const viewsController = require('../controllers/viewsController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

//-------------Here-------------//

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);

router.get(
  '/my-tours',
  authController.protect,
  viewsController.getMyBookedTours
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.use(authController.isLoggedIn);

router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

module.exports = router;
