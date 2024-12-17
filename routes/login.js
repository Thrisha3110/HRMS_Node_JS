
const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Configure email transporter with your email service details
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'narimeti.thrisha@brilyant.com',
    pass: 'Ammulu@2003..',
  },
});

// Middleware to authenticate JWT tokens
function authenticateToken(req,res,next) 
{
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}  
// Register (Create a new employee with password hashing)
router.post('/register', async (req, res) => {
const { employee_id, name, email, password, phone, doj, gender, department_id, designation_id, branch_id, address } = req.body;

  if (!employee_id || !name || !email || !password || !phone || !doj || !gender || !department_id || !designation_id || !branch_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password,10);
    const created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    const insertQuery = `
      INSERT INTO employee (
        employee_id, name, email, password, phone, doj, gender, department_id, designation_id, branch_id, address, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [employee_id, name, email, hashedPassword, phone, doj, gender, department_id, designation_id, branch_id, address, created_at, 1], (err, results) =>
         {
      if (err) return res.status(500).send(err);

      // Send welcome email
      const mailContent = {
        from: 'narimeti.thrisha@brilyant.com',
        to: email,
        subject: 'Welcome to the team!',
        html: `
          <h2>Hi ${name},</h2>
          <p>Welcome to the company! We're excited to have you on board.</p>
          <p>Your employee ID is ${employee_id}.</p>
        `,
      };

      transporter.sendMail(mailContent, (error) => {
        if (error) console.error('Error sending email:', error);
      });

      res.status(201).json({ message: 'Employee registered successfully', id: results.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// Login API
router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query('SELECT * FROM employee WHERE email = ? AND status = 1', [email], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) {
      
      responseData = {
          status: "400",
          message:"Record not found",
          data:{}
      }
      return res.json(responseData);
    } 
    responseData = {
        status: "200",
        message:"Get all records",
        data:{
          department: results[0]
        }
    }

    const user = results[0];

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
    {
      
      responseData = {
          status: "400",
          message:"Record not found",
          data:{}
      }
      return res.json(responseData);
    } 
    responseData = {
        status: "200",
        message:"Get all records",
        data:{
          department: results[0]
        }
    }
    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', { expiresIn: '60s' });
    res.status(200).json({ message: 'successful login', token });
  });
});

// Reset Password API
// router.post('/reset-password', async (req, res) => {
//   const { email, newPassword } = req.body;

//   if (!email || !newPassword) {
//     return res.status(400).json({ error: 'Email and new password are required' });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     db.query('UPDATE employee SET password = ? WHERE email = ? AND status = 1', [hashedPassword, email], (err, results) => {
//       if (err) return res.status(500).send(err);
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ error: 'Email not found or inactive account' });
//       }
//       res.json({ message: 'Password reset successfully' });
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Error hashing password' });
//   }
// });

// Protected Route Example
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;















