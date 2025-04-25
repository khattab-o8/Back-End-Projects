// MODULES:
const mongoose = require('mongoose');
const Tour = require('./tourModel');

//-------------Here-------------//
// Create simple schema & model:
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },

    rating: {
      type: Number,
      required: [true, 'Rating can not be empty!'],
      min: 1,
      max: 5
      /* 
        validate: {
          validator: function(val) {
            return val >= 1 && val <= 5;
          },

          message: 'The rating value is NOT correct!'
        }
      */
    },

    createdAt: {
      type: Date,
      default: Date.now() // Timestamp of now
    },

    // Parent referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false, // __v
    id: false
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // Compound Index

//-------------Here-------------//
// Query Middleware
reviewSchema.pre(/^find/, function(next) {
  /* 
    this.populate({
      path: 'tour',
      select: 'name'
    }).populate({
      path: 'user',
      select: 'name photo'
    });
  */

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this -> point to current Model.(Review)
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },

    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    const [statsObj] = stats;

    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: statsObj.numRating,
      ratingsAverage: statsObj.avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// eslint-disable-next-line no-unused-vars
reviewSchema.post('save', async function(doc) {
  // this -> point to current review document
  await this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate();
// findByIdAndDelete();
// Query Middleware.
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // this -> Point to current Query
  this.reviewDoc = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function(doc) {
  // this -> Point to current Query
  // await this.clone().findOne() doesn't work here, query has already executed

  // console.log('Updated Doc: ', doc);
  await this.reviewDoc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
