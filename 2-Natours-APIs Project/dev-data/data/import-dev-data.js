// MODULES:
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

//-------------Here-------------//
// Setup Configuration:
dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<DATABASE>', process.env.DATABASE_NAME);

(async () => {
  try {
    await mongoose.connect(DB);
    console.log('✨💫 DB connected successfully💯🚀🎯');
  } catch (err) {
    console.log(`ERROR 💥: ${err}`);
  }
})();

//-------------Here-------------//
// READ JSON FILE:
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//-------------Here-------------//
// IMPORT DATA INTO DB:
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('🛍️✨Data successfully loaded 🛒✔️');
  } catch (err) {
    console.log(`🚨ERROR❌:${err}`);
  }
  process.exit();
};

//-------------Here-------------//
// Delete ALL DATA FROM DB:
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('🧹Data successfully deleted ⚙️🚮');
  } catch (err) {
    console.log(`🚨ERROR❌:${err}`);
  }
  process.exit();
};

//-------------Here-------------//

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
