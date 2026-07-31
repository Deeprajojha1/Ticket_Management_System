class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.pagination = {};
  }

  search(fields = []) {
    const keyword = this.queryString.search || this.queryString.keyword;

    if (keyword && fields.length) {
      const regex = new RegExp(keyword.trim(), "i");
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }

    return this;
  }

  filter(allowedFields = []) {
    const filters = {};

    allowedFields.forEach((field) => {
      if (this.queryString[field]) {
        filters[field] = this.queryString[field];
      }
    });

    this.query = this.query.find(filters);
    return this;
  }

  sort() {
    const sortMap = {
      newest: "-createdAt",
      oldest: "createdAt",
      priority: "priorityWeight -lastActivity",
      status: "status -lastActivity",
    };

    this.query = this.query.sort(sortMap[this.queryString.sort] || "-lastActivity");
    return this;
  }

  paginate(totalDocuments) {
    const page = Math.max(Number.parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(this.queryString.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalDocuments / limit) || 1;

    this.pagination = {
      totalDocuments,
      totalPages,
      currentPage: page,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      limit,
    };

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
