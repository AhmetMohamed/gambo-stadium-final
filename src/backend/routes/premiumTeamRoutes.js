const express = require("express");
const router = express.Router();
const PremiumTeam = require("../models/PremiumTeam");

// Get all premium teams
router.get("/", async (req, res) => {
  try {
    const teams = await PremiumTeam.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get premium teams by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const teams = await PremiumTeam.find({ userId: req.params.userId });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new premium team
router.post("/", async (req, res) => {
  const team = new PremiumTeam({
    userId: req.body.userId,
    coach: req.body.coach,
    package: req.body.package,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    trainingDays: req.body.trainingDays,
    players: req.body.players || [],
  });

  try {
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a premium team
router.patch("/:id", async (req, res) => {
  try {
    const team = await PremiumTeam.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!team)
      return res.status(404).json({ message: "Premium team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
