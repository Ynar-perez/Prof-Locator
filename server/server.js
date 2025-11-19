const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const cors = require('cors');
const path = require('path');

// --- Route file Imports ---
const userRoutes = require('./routes/userRoutes'); 
const instructorRoutes = require('./routes/instructorRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(cors({
  origin: ["https://prof-locator.vercel.app", "http://localhost:5173"], // Allow Vercel and Localhost
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true // Allows cookies and headers to pass through
}));

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


// --- ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/instructor', instructorRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// A simple test route
app.get('/', (req, res) => {
  res.send('Server is running! API is ready.');
});