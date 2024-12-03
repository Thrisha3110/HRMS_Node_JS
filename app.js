const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const userRoutes = require('./routes/branch');
app.use('/api/branch', userRoutes);
const departmentRoutes = require('./routes/department');
app.use('/api/department', departmentRoutes);
const designationRoutes = require('./routes/designation');
app.use('/api/designation', designationRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


