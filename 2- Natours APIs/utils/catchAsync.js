module.exports = asyncFn => {
  return (req, res, next) => {
    asyncFn(req, res, next).catch(next);
    // Call-back fn behind the scenes (err) => {next(err)}
  };
};
