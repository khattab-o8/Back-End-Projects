// MODULES:
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//-------------Here-------------//
// Route Handlers:

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // Access Obj keys using bracket notation []
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Update -> Currently Authenticated User
exports.updateMe = catchAsync(async (req, res, next) => {
  //-------------Here-------------//
  // 1)- Create error if user POSTs password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is NOT for password update. Please use /updateMyPassword route.',
        400
      )
    );
  }

  //-------------Here-------------//
  // 2)- Filtered out unwanted field names that are not allowed to be updated.
  const filterdBody = filterObj(req.body, 'name', 'email');

  //-------------Here-------------//
  // 3)- Update user document.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is NOT defined yet! Please use /sign up instead.'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // Only For Administrators [Don't Update Password using this]
exports.deleteUser = factory.deleteOne(User);
