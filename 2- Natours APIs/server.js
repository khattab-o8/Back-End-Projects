//-------------Here-------------//
// Handle Uncaught Exception
process.on('uncaughtException', err => {
  console.log(`"Error Name": ${err.name}🍂\n"Error Message": ${err.message}📝`);
  console.log('UNCAUGHT EXCEPTION! 🛑 Shutting down...');

  process.exit(1);
});

//-------------Here-------------//
// MODULES:
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

//-------------Here-------------//
// Connect Database with our App:

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<DATABASE>', process.env.DATABASE_NAME);

mongoose.connect(DB).then(() => {
  console.log('✨💫 DB connection Successful!💯🚀🎯');
});

//-------------Here-------------//
// Start The Server:

const port = process.env.PORT;
const Server = app.listen(port, () => {
  console.log(`App running on port: ${port}...🚀`);
});

//-------------Here-------------//
// Last Safety Net
// Handle Unhandled Promise Rejection Globally:
process.on('unhandledRejection', err => {
  console.log(`"Error Name": ${err.name}🍂\n"Error Message": ${err.message}📝`);
  console.log('UNHANDLER REJECTION! 🛑 Shutting down...');

  Server.close(() => {
    process.exit(1);
  });
});
