const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Route file Imports ---
const userRoutes = require('./routes/userRoutes'); 
const instructorRoutes = require('./routes/instructorRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
  });
// --- End of Database Connection ---


// --- 💡 ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/instructor', instructorRoutes);

// A simple test route
app.get('/', (req, res) => {
  res.send('Server is running! API is ready.');
});