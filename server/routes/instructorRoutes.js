const express = require("express");
const router = express.Router();
const User = require("../models/User"); // We still use the User model
const { auth, isInstructor } = require("../middleware/authMiddleware");

// -----------------------------------------------------------------
// 💡 @route   GET /api/instructor/me
// 💡 @desc    Get the logged-in instructor's complete data
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.get("/me", [auth, isInstructor], async (req, res) => {
  try {
    // req.user.id comes from the auth middleware's token payload
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Instructor not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   PUT /api/instructor/status-override
// 💡 @desc    Instructor overrides their status for a set duration
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.put("/status-override", [auth, isInstructor], async (req, res) => {
  try {
    const { status, duration } = req.body;

    // --- Calculate the expiry date based on the duration ---
    let expiryDate = new Date();
    let newStatus = status;

    if (duration === "clear") {
      // "Clear" sets the expiry to null and status to a neutral 'Available'
      // Your front-end logic will then know to check the baseSchedule
      expiryDate = null;
      newStatus = "Available"; // Or 'Unavailable' if you prefer
    } else if (duration === "30m") {
      expiryDate.setMinutes(expiryDate.getMinutes() + 30);
    } else if (duration === "1h") {
      expiryDate.setHours(expiryDate.getHours() + 1);
    } else if (duration === "2h") {
      expiryDate.setHours(expiryDate.getHours() + 2);
    } else if (duration === "eod") {
      // Sets expiry to 5:00 PM of the current day
      expiryDate.setHours(17, 0, 0, 0);
    } else {
      return res.status(400).json({ msg: "Invalid duration provided" });
    }

    const updatedFields = {
      instructorStatus: newStatus,
      statusOverrideExpires: expiryDate,
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("instructorStatus statusOverrideExpires"); // Send back only what changed

    if (!user) {
      return res.status(404).json({ msg: "Instructor not found" });
    }

    res.status(200).json(user); // Send back the new override status and expiry
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   PUT /api/instructor/location
// 💡 @desc    Instructor updates their current location and room
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.put("/location", [auth, isInstructor], async (req, res) => {
  try {
    const { location, room } = req.body;

    // Optional: Add validation here to check against your locationConfig.js
    // For now, we trust the input from the dropdowns

    const updatedFields = {
      location: location,
      room: room,
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("location room"); // Send back only what changed

    if (!user) {
      return res.status(404).json({ msg: "Instructor not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   PUT /api/instructor/schedule
// 💡 @desc    Instructor updates their own BASE schedule
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.put("/schedule", [auth, isInstructor], async (req, res) => {
  try {
    // Expecting req.body.baseSchedule (not req.body.schedule)
    const { baseSchedule } = req.body;

    if (!Array.isArray(baseSchedule)) {
      return res.status(400).json({ msg: "Schedule must be an array" });
    }

    // Find the user and replace their entire schedule array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      // Use $set on the correct field name
      { $set: { baseSchedule: baseSchedule } },
      { new: true, runValidators: true }
    ).select("baseSchedule"); // Only send back the schedule

    if (!user) {
      return res.status(404).json({ msg: "Instructor not found" });
    }

    res.status(200).json({
      msg: "Base schedule updated successfully",
      baseSchedule: user.baseSchedule,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
