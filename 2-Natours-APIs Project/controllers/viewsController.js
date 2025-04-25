// MODULES:
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//-------------Here-------------//

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1)- Get tour data from collection
  const tours = await Tour.find();

  // 2)- Passing data to template
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: '-_id -createdAt'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https:; frame-ancestors 'self'; img-src 'self' blob: data:; object-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob:; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;"
  );

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getMyBookedTours = catchAsync(async (req, res, next) => {
  // 1)- Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2)- Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const UpdatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  // Re-render account page.
  res.status(200).render('account', {
    title: 'Your Account',
    user: UpdatedUser
  });
});
