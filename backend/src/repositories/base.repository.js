class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findAll(filter = {}, options = {}) {
    const limit = options.limit !== undefined ? Math.min(Number(options.limit), 50) : 50;
    return await this.model.find(filter, null, { ...options, limit }).lean();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  async updateById(id, data, options = {}) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async exists(filter) {
    return await this.model.exists(filter);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

export default BaseRepository;