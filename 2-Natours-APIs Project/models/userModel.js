// MODULES:
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//-------------Here-------------//
// Schema:
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name']
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email'
      }
    },

    role: {
      type: String,
      enum: ['user', 'guide'], // 'lead-guide', 'admin'
      default: 'user'
    },

    photo: {
      type: String,
      default: 'default.jpg'
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [8, 'Password should be at least 8 characters'],
      select: false // only works when reading data from DB NOT creating data for the first time
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(val) {
          // Only works on .create() and .save()
          return val === this.password;
        },
        message: 'The Password confirmation does not match!'
      }
    },

    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // Flag key
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  { versionKey: false } // __v: 0
);

// This function runs only if password was actually modified.
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // guard clause

  // Hash password with cost of 12.
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field.
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //  One second hack in the past
  next();
});

// Query Middleware
userSchema.pre(/^find/, function(next) {
  // this -> points to the current query.
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordChangedAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Generate a 32-byte token

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

  // console.log({ resetToken }, { encryptedVersion: this.passwordResetToken });
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
