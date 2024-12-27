const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

require('dotenv').config();
// Function to create a standardized response
function createResponse(status, message, data = {}, error = null) {
  return {
      status,
      message,
      data,
      ...(error && { error: error.message || error })
  };
}

// Configure email transporter with your email service details
const transporter = nodemailer.createTransport({
  // your email service configuration
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: 
  {
    user: 'narimeti.thrisha@brilyant.com' ,
    pass: 'Ammulu@2003..' ,
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
  //authenticateToken(req)
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
    
    let employeeResult = [];
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

    // employeeResult = results[0]

    return res.status(200).json({
      status: "200",
      message: "Get employee recorddddd",
      data: { 
      employeeResult : results,
  
      },
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
    if (results.length > 0) if (results.length === 0) {
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
      if (error) 
      {
       
      } 
      else 
      {
        
      }
    });
      
 
      res.status(201).json(results.insertId);
    });
  });
});
 
// Update an employee
router.put('/:id', (req, res) => 
  {
  const { id } = req.params;
  const { name, email, password, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id } = req.body;
 
  db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0)
      {
      responseData = 
      {
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

          //////// employee work experience //////       

// Get all work experiences
router.get('/experience/:employee_id', (req, res) => {
    const query = `SELECT * FROM employee_work_experience WHERE status = 1`;
    db.query(query, (err, results) => {
        if (err) {
            const responseData = createResponse('500', 'Failed to retrieve work experiences', {}, err);
            return res.status(500).json(responseData);
        }
        const responseData = createResponse('200', 'Work experience retrieved successfully', { workExperiences: results });
        res.json(responseData);
    });
});

// Get work experience by ID
router.get('/experience/:employee_id/:experience_id', (req, res) => {
  const { id } = req.params;
    const query = `SELECT * FROM employee_work_experience WHERE id = ? AND status = 1`;
    db.query(query, [id], (err, results) => {
        if (err) {
            const responseData = createResponse('500', 'Failed to retrieve work experience', {}, err);
            return res.status(500).json(responseData);
        }
        if (results.length === 0) {
            const responseData = createResponse('400', 'Working experience not found', {});
            return res.status(400).json(responseData);
        }
        const responseData = createResponse('200','Work experiencesss retrieved successfully', { workExperience: results[0] });
        res.json(responseData);
    });
});

// Add or post or insert new work experience
router.post('/experience/:employee_id', (req, res) => {
  const { employee_id } = req.params;
    const { employer,designation, joiningdate,relievingdate } = req.body;

    if (!employee_id || !employer || !designation||!joiningdate || !relievingdate) {
        const responseData = createResponse('400', 'Missing required fields', {});
        return res.status(400).json(responseData)
    }
    db.query('SELECT * FROM  employee WHERE id = ?', [employee_id], (err, results) => 
      {
      
      if (err) {
        responseData = {
          status: "500",
          message: err,
          data:{}
        }
        return res.json(responseData);
        
      }
      if (results.length == 0){ 
        responseData = {
            status: "400",
            message:"This employee not found",
            data:{}
        }
        return res.json(responseData);
      } 
    });


    const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO employee_work_experience (employee_id, employer,designation,joiningdate,relievingdate, created_at) VALUES (?, ?, ?, ?, ?,?)`;

    db.query(query, [employee_id, employer,designation, joiningdate,relievingdate , created_at], (err, results) => {
        if (err) {
            const responseData = createResponse('500', 'Failed to the add work experience', {}, err);
            return res.status(500).json(responseData);
        }
        const responseData = createResponse('200', 'Work experience added successfully', {id: results.insertId});
        res.json(responseData);

    });
});

// Update work experience by ID
router.put('/experience/:employee_id/:experience_id', (req, res) => {
  const { employee_id } = req.params;
  const { experience_id } = req.params;
  const { employer, designation, joiningdate,relievingdate } = req.body;

  if (!employee_id ||!experience_id|| !employer || !designation||!joiningdate || !relievingdate) {
      const responseData = createResponse('400', 'Missing required fields', {});
      return res.status(400).json(responseData);
  }
  db.query('SELECT * FROM  employee WHERE id = ?', [employee_id], (err, results) => 
    {
    
    if (err) {
      responseData = {
        status: "500",
        message: err,
        data:{}
      }
      return res.json(responseData);
      
    }

    if (results.length == 0){ 
      responseData = {
          status: "400",
          message:"This employee not found",
          data:{}
      }
      return res.json(responseData);
    } 
  });
  db.query('SELECT * FROM employee_work_experience WHERE id = ? AND employee_id = ?', [experience_id, employee_id], (err, results) => 
    {
    
    if (err) {
      responseData = {
        status: "500",
        message: err,
        data:{}
      }
      return res.json(responseData);
      
    }

    if (results.length == 0){ 
      responseData = {
          status: "400",
          message:"This work experience not found",
          data:{}
      }
      return res.json(responseData);
    } 
  });


    const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

    const query = `UPDATE employee_work_experience SET employer = ?, designation=?,joiningdate = ?, relievingdate=?, updated_at = ? WHERE id = ? AND status = 1`;
    db.query(query, [employer,designation,joiningdate,relievingdate,updated_at, experience_id], (err, results) => {
        if (err) {
            const responseData = createResponse('500','Failed to update work experience', {}, err);
            return res.status(500).json(responseData);
        }
        if (results.affectedRows === 0) {
            const responseData = createResponse('400','Work experience not found', {});
            return res.status(400).json(responseData);
        }
        const responseData = createResponse('200','Work experience updated successfully', { affectedRows: results.affectedRows });
        res.json(responseData);
    });
});


// Delete work experience 
router.delete('/experience/:employee_id/:experience_id', (req, res) => {
  const { employee_id } = req.params;
  const { experience_id } = req.params;
  const { employer, designation, joiningdate,relievingdate } = req.body;

  if (!employee_id ||!experience_id|| !employer || !designation||!joiningdate || !relievingdate) {
      const responseData = createResponse('400', 'Missing required fields', {});
      return res.status(400).json(responseData);
  }
  db.query('SELECT * FROM  employee WHERE id = ?', [employee_id], (err, results) => 
    {
    
    if (err) {
      responseData = {
        status: "500",
        message: err,
        data:{}
      }
      return res.json(responseData);
      
    }

    if (results.length == 0){ 
      responseData = {
          status: "400",
          message:"This employee not found",
          data:{}
      }
      return res.json(responseData);
    } 
  });
  db.query('SELECT * FROM employee_work_experience WHERE id = ? AND employee_id = ?', [experience_id, employee_id], (err, results) => 
    {
    
    if (err) {
      responseData = {
        status: "500",
        message: err,
        data:{}
      }
      return res.json(responseData);
      
    }

    if (results.length == 0){ 
      responseData = {
          status: "400",
          message:"This work experience not found",
          data:{}
      }
      return res.json(responseData);
    } 
  });


    const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

    const query = `UPDATE employee_work_experience SET status = 0 WHERE id = ? AND employee_id = ?`;
    db.query(query, [experience_id, employee_id], (err, results) => {
        if (err) {
            const responseData = createResponse('500','Failed to update work experience', {}, err);
            return res.status(500).json(responseData);
        }
        if (results.affectedRows === 0) {
            const responseData = createResponse('400','Work experience not found', {});
            return res.status(400).json(responseData);
        }
        const responseData = createResponse('200','Work experience deleted successfully', { affectedRows: results.affectedRows });
        return res.json(responseData);
    });
});
                 ///////employee documents///////
// Get all documents for all employees
router.get('/document', (req, res) => {
  // Retrieve all documents from the employee_documents table
  db.query('SELECT * FROM employee_documents', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      const responseData = {
        status: '500',
        message: 'Database error',
        data: {}
      };
      return res.status(500).json(responseData);
    }
    const responseData = {
      status: '200',
      message: 'All documents retrieved successfully',
      data: results
    };
    res.json(responseData);
  });
});

// Get all documents by employee ID
router.get('/document/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  // Check if the employee exists
  db.query('SELECT * FROM employee WHERE id = ?', [employee_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      const responseData = {
        status: '500',
        message: 'Database error',
        data: {}
      };
      return res.status(500).json(responseData);
    }

    if (results.length === 0) {
      const responseData = {
        status: '400',
        message: 'Employee not found',
        data: {}
      };
      return res.status(400).json(responseData);
    }
    db.query('SELECT * FROM employee_documents WHERE employee_id = ?', [employee_id], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        const responseData = {
          status: '500',
          message: 'Database error',
          data: {}
        };
        return res.status(500).json(responseData);
      }

      const responseData = {
        status: '200',
        message: 'Documents retrieved successfully',
        data: results
      };
      res.json(responseData);
    });
  });
});
// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
      // Extract the file extension
      const extension = path.extname(file.originalname);
      if (!extension) {
          return cb(new Error('File extension missing!'));
      }

      // Generate a unique name with the original extension
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
      cb(null, uniqueName);
  }
});

// Middleware for file upload
const uploads = multer({ storage });
// Add or post or insert new work documents
      router.post('/document/:employee_id', uploads.single('document_name'), (req, res) => {
      const { employee_id } = req.params;
      const {  purpose } = req.body;
      const file = req.file;
      if (!req.file) {
          const responseData = {
              status: '400',
              message: 'Missing required fields or file',
              data: { file }
          };
          return res.status(400).json(responseData);
      }

      db.query('SELECT * FROM employee WHERE id = ?', [employee_id], (err, results) => {
          if (err) {
              console.error('Database error:', err);
              const responseData = {
                  status: '500',
                  message: 'Database error',
                  data: {}
              };
              return res.status(500).json(responseData);
          }

          if (results.length === 0) {
              const responseData = {
                  status: '400',
                  message: 'Employee not found',
                  data: {}
              };
              return res.status(400).json(responseData);
          }

          const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
          const query = `INSERT INTO employee_documents (employee_id, document_name, purpose, created_at) VALUES (?, ?, ?, ?)`;
          db.query(query, [employee_id, file.filename, purpose, created_at], (err, results) => {
              if (err) {
                  console.error('Insert error:', err);
                  const responseData = {
                      status: '500',
                      message: 'Failed to add employee documents',
                      data: {}
                  };
                  return res.status(500).json(responseData);
              }

              const responseData = {
                  status: '200',
                  message: 'Employee document added successfully',
                  data: { id: results.insertId }
              };
              res.json(responseData);
          });
      });
  
});

// Update work documents by ID
router.put('/document/:employee_id/:document_id', uploads.single('document_name'), (req, res) => {
  const { employee_id, document_id } = req.params;
  const {  purpose } = req.body;
  const file = req.file;

  // Validate required fields
  if ( !purpose || !file)  {
      const responseData = {
          status: '400',
          message: 'Missing required fields',
          data: {}
      };
      return res.status(400).json(responseData);
  }

  // Check if the employee exists
  db.query('SELECT * FROM employee WHERE id = ?', [employee_id], (err, results) => {
      if (err) {
          console.error('Database error:', err);
          const responseData = {
              status: '500',
              message: 'Database error',
              data: {}
          };
          return res.status(500).json(responseData);
      }

      if (results.length === 0) {
          const responseData = {
              status: '400',
              message: 'Employee not found',
              data: {}
          };
          return res.status(400).json(responseData);
      }

      // Check if the document exists
      db.query('SELECT * FROM employee_documents WHERE id = ? AND employee_id = ?', [document_id, employee_id], (err, results) => {
          if (err) {
              console.error('Database error:', err);
              const responseData = {
                  status: '500',
                  message: 'Database error',
                  data: {}
              };
              return res.status(500).json(responseData);
          }

          if (results.length === 0) {
              const responseData = {
                  status: '400',
                  message: 'Document not found',
                  data: {}
              };
              return res.status(400).json(responseData);
          }

        // Update the document in the database
          const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
          const query = `UPDATE employee_documents SET document_name = ?, purpose = ?, updated_at = ? WHERE id = ?`;

          db.query(query, [ file ? file.filename : results[0].document_name,purpose, updated_at, document_id], (err, results) => {
              if (err) {
                  console.error('Update error:', err);
                  const responseData = {
                      status: '500',
                      message: 'Failed to update employee document',
                      data: {}
                  };
                  return res.status(500).json(responseData);
              }

              const responseData = {
                  status: '200',
                  message: 'Employee document updated successfully',
                  data: { id: document_id }
              };
              res.json(responseData);
          });
      });
  });
});

// Delete a document 
router.delete('/document/:employee_id/:document_id', (req, res) => {
  const { employee_id, document_id } = req.params;

  // Check if the employee exists
  db.query('SELECT * FROM employee WHERE id = ?', [employee_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      const responseData = {
        status: '500',
        message: 'Database error',
        data: {}
      };
      return res.status(500).json(responseData);
    }

    if (results.length === 0) {
      const responseData = {
        status: '400',
        message: 'Employee not found',
        data: {}
      };
      return res.status(400).json(responseData);
    }
    // Check if the document exists
    db.query('SELECT * FROM employee_documents WHERE id = ? AND employee_id = ?', [document_id, employee_id], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        const responseData = {
          status: '500',
          message: 'Database error',
          data: {}
        };
        return res.status(500).json(responseData);
      }

      if (results.length === 0) {
        const responseData = {
          status: '400',
          message: 'Document not found',
          data: {}
        };
        return res.status(400).json(responseData);
      }
  // Delete the document from the database:
        //const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        const query = `UPDATE employee_documents SET status = 0 WHERE id = ? AND employee_id = ?`;
        db.query(query, [document_id, employee_id], (err, results) => {
        if (err) {
          console.error('Delete error:', err);
          const responseData = {
            status: '500',
            message: 'Failed to delete employee document',
            data: {}
          };
          return res.status(500).json(responseData);
        }
        const responseData = {
          status: '200',
          message: 'Employee document deleted successfully',
          data: {id:document_id} 
        };
        res.json(responseData);
      });
    });
  });
});
// Delete an employee
router.delete('/:id', (req,res) => {
  const { id } = req.params;
  db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
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
    // Proceed with deletion if the employee is not active
    db.query('UPDATE employee SET status = 0 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).send(err);
      res.send('Employee deleted successfully');
    });
  });
});
module.exports = router;
