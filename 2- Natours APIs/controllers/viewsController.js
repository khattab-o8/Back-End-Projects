// MODULES:
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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

  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});
