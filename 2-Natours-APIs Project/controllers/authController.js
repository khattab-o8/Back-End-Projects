// MODULES:
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
//-------------Here-------------//

// Authentication Controllers:

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res, sendData = false) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    ...(process.env.NODE_ENV === 'production' ? { secure: true } : {}),
    httpOnly: true
  };

  // Remove password from output.
  user.password = undefined;

  res
    .cookie('jwt', token, cookieOptions)
    .status(statusCode)
    .json({
      status: 'success',
      token,
      ...(sendData ? { data: { user } } : {})
    });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res, true);
});

exports.login = catchAsync(async (req, res, next) => {
  //-------------Here-------------//
  // 1)- Check email and password exist

  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //-------------Here-------------//
  // 2)- Check if the user exists && password is correct

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //-------------Here-------------//
  // 3)- If everything is okay, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //-------------Here-------------//
  // 1)- Getting token and check if it exists
  const authorizationKey = req.headers.authorization;
  let token;

  if (authorizationKey && authorizationKey.startsWith('Bearer')) {
    token = authorizationKey.split(' ').at(1);
  }

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  //-------------Here-------------//
  // 2)- Verification token
  const promisifyingJWTVerify = promisify(jwt.verify); // Creates async fn
  const decoded = await promisifyingJWTVerify(token, process.env.JWT_SECRET); // Execute async fn

  //-------------Here-------------//
  // 3)- Check if user still exists.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  //-------------Here-------------//
  // 4) Check if user does not change password after the token was issued
  if (currentUser.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // Manipulate req object
  res.locals.user = currentUser;

  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1)- Verify token
      const promisifyingJWTVerify = promisify(jwt.verify); // Creates async fn
      // Execute async fn
      const decoded = await promisifyingJWTVerify(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2)- Check if user still exists.
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user does not change password after the token was issued
      if (currentUser.isPasswordChangedAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

// (restrictTo) Wrapper Fn:
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']
    // Let's say req.user.role = 'user'

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //-------------Here-------------//
  // 1)- Get user based on Posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  //-------------Here-------------//
  // 2)- Generate simple random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });

  //-------------Here-------------//

  // 3)- Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: true });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //-------------Here-------------//
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() } // still in the future to be valid
    // passwordResetExpires > right NOW
  });

  //-------------Here-------------//
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateModifiedOnly: true });

  //-------------Here-------------//
  // 3) Update passwordChangedAt property for the user

  // Done automatically behind the scenes using pre-save hook middleware

  //-------------Here-------------//
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

// updatePassword -> Only for authenticated users (Logged in users)
exports.updatePassword = catchAsync(async (req, res, next) => {
  //-------------Here-------------//
  // 1) Get user from collection
  const user = await User.findById(`${req.user.id}`).select('+password');

  //-------------Here-------------//
  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  //-------------Here-------------//
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateModifiedOnly: true });
  // User.findByIdAndUpdate() wil NOT work as intended!

  //-------------Here-------------//
  //4) Log user in, send JWT
  createSendToken(user, 200, res);
});
