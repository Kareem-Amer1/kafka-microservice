const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId:      { type: String, required: true, index: true },
  action:      { type: String, required: true, index: true },
  metadata:    { type: mongoose.Schema.Types.Mixed,default: {} },
  timestamp:   { type: Date, default: Date.now, index: true },
  processedAt: { type: Date ,default: null}
});

activityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);