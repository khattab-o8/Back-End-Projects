// MODULES:
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

//-------------Here-------------//
// Create simple schema & model:
/**
 * @type {mongoose.SchemaDefinitionProperty}
 */

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A tour must have a name'],
      maxLength: [40, 'A tour name must have less or equal than 40 characters'],
      minLength: [10, 'A tour name must have more or equal than 10 characters']
      /*
      validate: {
        validator: validator.isAlpha,
        message: 'Tour name must only contain characters'
      }
   
        [validator.isAlpha, 'Tour name must only contain characters']
      */
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy or medium or difficult!'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Ratings must be below 5.0'],
      min: [1, 'Ratings must be above 1.0'],
      set: val => Math.round(val * 10) / 10 // 4.6666666, 46.666666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a Price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this-> only points to the current document on NEW document creation.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
      /*
        [
          function(val) {
            return val <= this.name;
          },
          'Tour price Discount ({VALUE}) should be equal or less than the tour price'
        ]
      */
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },

    // An Embedded Object
    startLocation: {
      // GeoJSON Data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        day: Number
      }
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId, // Key
        ref: 'User' // Address
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    id: false
  }
);

// tourSchema.index({ price: 1 }); // Single Index
tourSchema.index({ price: 1, ratingsAverage: -1 }); // Compound Index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//-------------Here-------------//
// VIRTUAL PROPERTY:
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // The name of the field in the other Model
  localField: '_id' // The reference of the current Model document "tour document"
});

//-------------Here-------------//
// DOCUMENT MIDDLEWARE:
// runs before .save() & .create() NOT .insertMany()

tourSchema.pre('save', function(next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*
tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id)); // Array of pending Promises

  this.guides = await Promise.all(guidesPromises); // overrides guides Array
  next();
});


tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/

//-------------Here-------------//
// QUERY MIDDLEWARE:

// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took: "${Date.now() - this.start}" milliseconds`);
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-passwordChangedAt'
  });

  next();
});

//-------------Here-------------//
// AGGREGATION MIDDLEWARE:

tourSchema.pre('aggregate', function(next) {
  if (!this.pipeline().some(stage => stage.$geoNear)) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }

  console.log(this.pipeline());
  next();
});

//-------------Here-------------//
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
