const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { auth, isAdmin } = require("../middleware/authMiddleware");

// -----------------------------------------------------------------
// Helper functions to calculate current instructor status/location
// -----------------------------------------------------------------
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
// 💡 @route   GET /api/users (READ - Admin Only)
// 💡 @desc    Get all users
// 💡 @access  Private (Admin)
// -----------------------------------------------------------------
router.get("/", [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   POST /api/users/register (CREATE - Admin Only)
// 💡 @access  Private (Admin)
// -----------------------------------------------------------------
// We are adding the security check here: [auth, isAdmin]
router.post("/register", [auth, isAdmin], async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    user = new User({ name, email, password, role: role || "STUDENT" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Since this is an Admin creating the user, we don't usually return a token,
    // but the newly created user (excluding password).
    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   POST /api/users/login
// 💡 @desc    Log in a user and get a token
// 💡 @access  Public
// -----------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    // 1. Get email and password from the request body
    const { email, password } = req.body;

    // 2. Find the user by their email in the database
    const user = await User.findOne({ email });

    // 3. Check if user exists.
    //    If not, send a generic "Invalid Credentials" error.
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // 4. Compare the submitted password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);

    // 5. If passwords don't match, send the same generic error.
    //    (This prevents attackers from knowing *which* part was wrong)
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // 6. If passwords match, user is valid. Create a JWT payload.
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    };

    // 7. Sign and send the token back
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token }); // Send 200 OK for a successful login
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   GET /api/users/me
// 💡 @desc    Get the logged-in user's data
// 💡 @access  Private (because we use the 'auth' middleware)
// -----------------------------------------------------------------
router.get("/me", auth, async (req, res) => {
  res.status(200).json(req.user);
});

// -----------------------------------------------------------------
// 💡 @route   PUT /api/users/:id (UPDATE - Admin Only)
// 💡 @access  Private (Admin)
// -----------------------------------------------------------------
router.put("/:id", [auth, isAdmin], async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Check if the request includes a new password and hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Find the user by ID and update the fields provided in the body
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, // $set updates only the fields provided
      { new: true, runValidators: true } // 'new: true' returns the updated document
    ).select("-password"); // Exclude the password from the response

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User updated successfully", user });
  } catch (err) {
    console.error(err.message);
    // This catches errors like invalid MongoDB ObjectId format
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Invalid user ID format" });
    }
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   DELETE /api/users/:id (DELETE - Admin Only)
// 💡 @access  Private (Admin)
// -----------------------------------------------------------------
router.delete("/:id", [auth, isAdmin], async (req, res) => {
  try {
    const userId = req.params.id;

    // Use findByIdAndDelete to remove the user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the Admin is trying to delete themselves (optional, but good)
    if (user._id.toString() === req.user.id) {
      // You might want to implement a stronger check to prevent self-deletion
    }

    res.status(200).json({ msg: "User removed successfully" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Invalid user ID format" });
    }
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// 💡 @route   GET /api/users/instructors
// 💡 @desc    Get all instructors, their status, and schedule (Student View)
// 💡 @access  Private (Any authenticated user)
// -----------------------------------------------------------------
router.get("/instructors", auth, async (req, res) => {
  try {
    // 1. Find all users where the role is 'INSTRUCTOR'
    const instructors = await User.find({ role: "INSTRUCTOR" })
      // 2. Select only the fields the student needs to see
      .select("name email instructorStatus baseSchedule location room")
      // 3. Sort them alphabetically by name
      .sort({ name: 1 });

    // 4. Calculate the current status/location for each instructor
    const instructorsWithStatus = instructors.map(instructor => {
      const currentStatus = calculateCurrentStatus(instructor);
      return {
        ...instructor.toObject(),
        currentStatus,
      };
    });

    res.status(200).json(instructorsWithStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
