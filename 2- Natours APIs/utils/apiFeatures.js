class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = Object.assign({}, this.queryString);

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replaceAll(',', ' ');
      this.query = this.query.sort(sortBy);
      // sort(price ratingsAverage)
    } else {
      // Default
      this.query = this.query.sort('-createdAt _id');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.replaceAll(',', ' ');

      if (fields.includes('password')) {
        fields = fields.replaceAll('password', ''); // Security Measure For User Resource
      }

      this.query = this.query.select(fields);
    } else {
      // Default
      this.query = this.query.select('-__v'); // (-)-> Exclude __v
    }

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
