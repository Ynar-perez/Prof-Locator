const express = require('express');
const router = express.Router();
const User = require('../models/User'); // We still use the User model
const { auth, isInstructor } = require('../middleware/authMiddleware');

// -----------------------------------------------------------------
// 💡 @route   PUT /api/instructor/status
// 💡 @desc    Instructor updates their own status
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.put('/status', [auth, isInstructor], async (req, res) => {
  try {
    const { status } = req.body;

    // We use req.user.id from the token payload to ONLY update the logged-in user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { status: status } },
      { new: true, runValidators: true }
    ).select('-password -schedule'); // Exclude password and schedule for a cleaner response

    if (!user) {
      return res.status(404).json({ msg: 'Instructor not found' });
    }

    res.status(200).json({ 
        msg: 'Status updated successfully',
        status: user.status 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// -----------------------------------------------------------------
// 💡 @route   PUT /api/instructor/schedule
// 💡 @desc    Instructor updates their own schedule
// 💡 @access  Private (Instructor)
// -----------------------------------------------------------------
router.put('/schedule', [auth, isInstructor], async (req, res) => {
  try {
    // Expecting req.body.schedule to be the entire new array of schedule items
    const { schedule } = req.body; 

    // Find the user and replace their entire schedule array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { schedule: schedule } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Instructor not found' });
    }

    res.status(200).json({ 
        msg: 'Schedule updated successfully',
        schedule: user.schedule 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;