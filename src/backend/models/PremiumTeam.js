const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: String,
  age: String,
});

const PremiumTeamSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    type: mongoose.Schema.ObjectId,
  },
  coach: {
    type: String,
    required: true,
  },
  package: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  trainingDays: [String],
  players: [PlayerSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PremiumTeam", PremiumTeamSchema);
