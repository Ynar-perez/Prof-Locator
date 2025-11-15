const express = require("express");
const router = express.Router();
const User = require("../models/User"); // We still use the User model
const { auth, isInstructor } = require("../middleware/authMiddleware");

const getTodaysDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const calculateCurrentStatus = (instructor) => {
  const now = new Date();

  // 1. Check for an active override
  // Does an override exist AND is it in the future?
  if (instructor.statusOverrideExpires && instructor.statusOverrideExpires > now) {
    return {
      status: instructor.instructorStatus, // This is the override status
      location: instructor.location, // Use the user's base location
      room: instructor.room,         // Use the user's base room
      overrideExpires: instructor.statusOverrideExpires,
    };
  }

  // 2. No override. Check the base schedule.
  const today = getTodaysDay();
  const currentTime = getCurrentTime();

  const currentScheduleItem = instructor.baseSchedule.find(item => {
    return item.day === today && 
           item.startTime <= currentTime && 
           item.endTime > currentTime;
  });

  if (currentScheduleItem) {
    // Found a matching item in the schedule
    return {
      status: currentScheduleItem.status,
      location: currentScheduleItem.location,
      room: currentScheduleItem.room,
      overrideExpires: null,
    };
  }

  // 3. No override and not in a scheduled class.
  // Return a sensible default (e.g., "Available" at their main office)
  return {
    status: "Available", // Default status
    location: instructor.location, // Default location
    room: instructor.room,         // Default room
    overrideExpires: null,
  };
};

// -----------------------------------------------------------------
// 💡 @route   GET /api/instructor/me/dashboard   [NEW]
// 💡 @desc    Get all data for the instructor dashboard
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.get("/me/dashboard", [auth, isInstructor], async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Instructor not found" });
    }

    // 1. Calculate the instructor's current status
    const currentState = calculateCurrentStatus(user);

    // 2. Format the profile data
    const profile = {
      name: user.name,
      email: user.email,
    };

    // 3. Format the full schedule
    // We map it to rename 'day' to 'dayOfWeek' for the frontend
    // and ensure a unique '_id' for React keys.
    const fullSchedule = user.baseSchedule.map((item, index) => {
      // item.toObject() cleans it of Mongoose metadata
      const itemObj = item.toObject ? item.toObject() : { ...item };
      return {
        ...itemObj,
        _id: item._id || index, // Use real _id if it exists, else index
        dayOfWeek: item.day,    // Rename 'day' to 'dayOfWeek'
      };
    });

    // 4. Send the complete dashboard object
    res.status(200).json({
      profile,
      currentState,
      fullSchedule,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   POST /api/instructor/status-override  [MODIFIED]
// 💡 @desc    Instructor overrides their status for a set duration
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
// Changed to POST to match frontend, but PUT is also acceptable.
// The frontend *is* sending POST, so let's match it.
router.post("/me/status-override", [auth, isInstructor], async (req, res) => {
  try {
    // Frontend sends 'status' and 'duration' ('30', '60', 'eod')
    const { status, duration } = req.body;

    let expiryDate = new Date();
    
    // Logic to match frontend's duration values
    if (duration === "30") {
      expiryDate.setMinutes(expiryDate.getMinutes() + 30);
    } else if (duration === "60") {
      expiryDate.setHours(expiryDate.getHours() + 1);
    } else if (duration === "120") {
      expiryDate.setHours(expiryDate.getHours() + 2);
    } else if (duration === "eod") {
      expiryDate.setHours(17, 0, 0, 0); // 5:00 PM today
    } else {
      // Handle the "clear" case or any other invalid value
      // We can set the override to null, which clears it.
      expiryDate = null;
      // We set the status back to a 'neutral' one.
      // Our `calculateCurrentStatus` logic will then take over.
      status = "Available"; // or "Unavailable"
    }

    const updatedFields = {
      instructorStatus: status,
      statusOverrideExpires: expiryDate,
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("instructorStatus statusOverrideExpires");

    if (!user) {
      return res.status(404).json({ msg: "Instructor not found" });
    }

    // Send a simple success message, the frontend will refetch
    res.status(200).json({ success: true, message: "Status updated." });

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
    const updatedFields = { location, room };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("location room");

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
// 💡 @route   GET /api/instructor/me
// 💡 @desc    Get the logged-in instructor's complete raw data
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.get("/me", [auth, isInstructor], async (req, res) => {
  try {
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
// 💡 @route   PUT /api/instructor/schedule
// 💡 @desc    Instructor updates their own BASE schedule
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.put("/schedule", [auth, isInstructor], async (req, res) => {
  try {
    const { baseSchedule } = req.body;
    if (!Array.isArray(baseSchedule)) {
      return res.status(400).json({ msg: "Schedule must be an array" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { baseSchedule: baseSchedule } },
      { new: true, runValidators: true }
    ).select("baseSchedule");

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
