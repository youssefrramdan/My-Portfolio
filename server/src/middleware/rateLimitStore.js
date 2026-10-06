import mongoose from 'mongoose';

const rateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    hits: { type: Number, required: true },
    // MongoDB removes a counter once its window is over.
    resetAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false },
);

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);

/**
 * express-rate-limit store kept in MongoDB, so every server instance (serverless functions start many) shares one
 * counter per key. `prefix` keeps each limiter's counters apart. Uses the driver directly: the update is a pipeline
 * (start a new window or add a hit in one atomic step), and keys are built by express-rate-limit, not users.
 */
export default class MongoRateLimitStore {
  localKeys = false;

  constructor(prefix) {
    this.prefix = `${prefix}:`;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const now = new Date();
    const open = { $gt: ['$resetAt', now] };
    const counter = await RateLimit.collection.findOneAndUpdate(
      { key: this.prefix + key },
      [
        {
          $set: {
            hits: { $cond: [open, { $add: ['$hits', 1] }, 1] },
            resetAt: { $cond: [open, '$resetAt', new Date(now.getTime() + this.windowMs)] },
          },
        },
      ],
      { upsert: true, returnDocument: 'after' },
    );
    return { totalHits: counter.hits, resetTime: counter.resetAt };
  }

  async get(key) {
    const counter = await RateLimit.collection.findOne({ key: this.prefix + key });
    return counter && counter.resetAt > new Date() ? { totalHits: counter.hits, resetTime: counter.resetAt } : undefined;
  }

  async decrement(key) {
    await RateLimit.collection.updateOne({ key: this.prefix + key, hits: { $gt: 0 } }, { $inc: { hits: -1 } });
  }

  async resetKey(key) {
    await RateLimit.collection.deleteOne({ key: this.prefix + key });
  }
}
