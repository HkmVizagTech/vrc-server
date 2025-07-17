const mongoose = require("mongoose");

const serviceCoordinatorSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  coordinatorName: {
    type: String,
    required: true,
    trim: true,
  },
  coordinatorNumber: {
    type: String,
    required: true,
    trim: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("servicecoordinator", serviceCoordinatorSchema);