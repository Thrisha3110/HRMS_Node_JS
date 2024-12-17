const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Configure email transporter with your email service details
const transporter = nodemailer.createTransport({
  // your email service configuration
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: 
  {
    user: 'narimeti.thrisha@brilyant.com',
    pass: 'Ammulu@2003..',
  }
});
// Middleware to verify JWT token
function authenticateToken(req,res,next) {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

  if (!token) 
  {
    return res.status(401).json({ message: 'Token not found. Please log in again.' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token. Please log in again.' });
    }
    req.user = user; // Attach user info to the request object
    next();
  });
};

// Get all employees
router.get('/', authenticateToken, (req, res) => {
  const { id } = req.params;

  const getDetailsQuery = `
SELECT e.id, e.employee_id, e.name, e.email, e.phone, e.doj,
d.name AS department_name, des.name AS designation_name, b.name AS branch_name
    FROM employee e
JOIN department d ON e.department_id = d.id
JOIN designation des ON e.designation_id = des.id
JOIN branch b ON e.branch_id = b.id
  `;
  db.query(getDetailsQuery, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
}); 
// Get an employee by ID
router.get('/:id', (req, res) => {
  authenticateToken(req)
  var responseData = {};
  const { id } = req.params;
  const getDetailsQuery = `
SELECT e.id, e.employee_id, e.name, e.email, e.phone, e.doj,
d.name AS department_name, des.name AS designation_name, b.name AS branch_name
    FROM employee e
JOIN department d ON e.department_id = d.id
JOIN designation des ON e.designation_id = des.id
JOIN branch b ON e.branch_id = b.id
WHERE e.id = ?
  `;
db.query(getDetailsQuery, [id], (err, results) => {
  if (err) {
    return res.status(500).send({ error: 'Database error', details: err });
  }

  if (results.length === 0) {
    return res.status(404).json({
      status: "400",
      message: "Record not found",
      data: {},
    });
  }

  const employee = processEmployeeDetails(results[0]);
  res.json({
    status: "200",
    message: "Get employee record",
    data: { employee },
  });
});
});
// Create a new employee
router.post('/',async (req, res) => {
  const { employee_id, name, email,password, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id } = req.body;
 
  // Validate required fields
  if (!employee_id || !name || !email ||!password|| !phone || !doj || !gender || !department_id || !designation_id || !branch_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
                                                               
  // Check for duplicate employee_id
  db.query('SELECT * FROM employee WHERE employee_id = ?', [employee_id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }
const created_at = moment().format('YYYY-MM-DD HH:mm:ss'); 

    const insertQuery = `
      INSERT INTO employee (
        employee_id, name, email,password,phone, emergency_contact, doj, gender, blood_group,
        department_id, designation_id, branch_id, address, account_num, manager_id, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;
 
    db.query(insertQuery, [employee_id, name, email, hashedPassword, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id, created_at, 1], (err, results) => {
      if (err) return res.status(500).send(err);
      
      // Send email notification
    const mailContent = {
      from: 'narimeti.thrisha@brilyant.com', 
      to: req.body.email,
      subject: 'Welcome to the team!',
      html: `
  Hi ${req.body.name},</h2>
        <p>Welcome to the company! We're excited to have you on board.</p>
        <p>Employee ID : ${req.body.employee_id}.</p>
         <p>Email: ${req.body.email}</p>
        <p>Password: ${req.body.password}</p>
      `,
    };

    transporter.sendMail(mailContent, (error, info) => {
      if (error) {
       
      } else {
        
      }
    });
      
 
      res.status(201).json(results.insertId);
    });
  });
});
 
// Update an employee
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id } = req.body;
 
  db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0)
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
 
    const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    db.query(
      'UPDATE employee SET name = ?, email = ?,password=?, phone = ?, emergency_contact = ?, doj = ?, gender = ?, blood_group = ?, department_id = ?, designation_id = ?, branch_id = ?, address = ?, account_num = ?, manager_id = ?, updated_at = ? WHERE id = ?',
      [name, email, password, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id, updated_at, id],
      (err) => {
        if (err) return res.status(500).send(err);
        res.send('Employee updated successfully');
      }
    );
  });
});
 
// Delete an employee
router.delete('/:id', (req, res) => {
  const { id } = req.params;
 
  db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
 
    // Proceed with deletion if the employee is not active
    db.query('UPDATE employee SET status = 0 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).send(err);
      res.send('Employee deleted successfully');
    });
  });
});
module.exports = router;