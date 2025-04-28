const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
// Get all bookings
router.get("/", async (req, res) => {
  try {
    // Find bookings and populate user data
    const bookings = await Booking.find().populate("userId");

    // Enhance bookings with user information using proper populate
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findOne({ id: booking.userId });
        const bookingObj = booking.toObject();
        if (user) {
          bookingObj.userName = user.name;
        }
        return bookingObj;
      })
    );

    res.json(enhancedBookings);
  } catch (err) {
    console.error("Error getting all bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get bookings by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate(
      "userId"
    );

    // Enhance bookings with user information using proper populate
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findOne({ id: booking.userId });
        const bookingObj = booking.toObject();

        if (user) {
          bookingObj.userName = user.name;
        }
        return bookingObj;
      })
    );

    res.json(enhancedBookings);
  } catch (err) {
    console.error("Error getting user bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new booking
// router.post('/', async (req, res) => {
//   try {
//     // First, verify the user exists and get their information
//     const user = await User.findOne({ id: req.body.userId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const booking = new Booking({
//       id: req.body.id,
//       userId: req.body.userId,
//       groundId: req.body.groundId,
//       groundName: req.body.groundName,
//       userName: user.name, // Set userName from the actual user record
//       date: req.body.date,
//       startTime: req.body.startTime,
//       endTime: req.body.endTime,
//       price: req.body.price,
//       status: req.body.status || 'confirmed',
//       paymentId: req.body.paymentId
//     });

//     const newBooking = await booking.save();
//     res.status(201).json(newBooking);
//   } catch (err) {
//     console.error('Error creating booking:', err);
//     res.status(400).json({ message: err.message });
//   }
// });

// Create a new booking ===============
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // 👈 From token, not from body
    const {
      groundId,
      groundName,
      date,
      startTime,
      endTime,
      price,
      status,
      paymentId,
    } = req.body;

    if (!groundId || !groundName || !date || !startTime || !endTime || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const booking = new Booking({
      userId,
      groundId,
      groundName,
      userName: user.name,
      date,
      startTime,
      endTime,
      price,
      status: status || "confirmed",
      paymentId: paymentId || null,
    });

    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error creating booking:", err.message);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
});

// Update a booking
router.patch("/:id", async (req, res) => {
  try {
    // If updating user-related fields, verify user exists
    if (req.body.userId) {
      const user = await User.findOne({ id: req.body.userId });
      if (user) {
        req.body.userName = user.name;
      }
    }

    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
