const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');

// Get all users
router.get('/', (req, res) => {

  db.query('SELECT * FROM designation' , (err, results) => {
    if (err) return res.status(500).send(err);
    responseData = {
      status: "200",
      message:"Record found",
      data:{results}
  }
  return res.json(responseData);
   
  }); 
});

router.get('/backup-data', (req, res) => {
  db.query('SELECT * FROM designation', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results) ; 
  }); 
})

// Get a designation by ID
router.get('/:id', (req, res) => {
  var responseData = {};
  const { id } = req.params;
  db.query('SELECT * FROM designation WHERE id = ?', [id], (err, results) => {
    if (err){
      responseData = {
        status: "400",
        message: err,
        data:{}
      }
      return res.json(responseData);
      
    } 
    if (results.length === 0){
      //return res.status(404).send('sorry branch not found');
      responseData = {
          status: "400",
          message:"designation not found",
          data:{}
      }
      return res.json(responseData);
    } else{
      responseData = {
        status: "200",
        message:"record found successfully",
        data:{
          result : results[0]
        }
      }
      return res.json(responseData);
    }
  });
});

// Create a new user
router.post('/', (req, res) => {
  const {name} = req.body;

  if (!name) {
   return res.status(400).json({ error: 'Name is required' });
  }
  // Check if the name already exists for a different record
  db.query('SELECT * FROM designation WHERE name = ?', [name], (err, results) => 
    {
    
    if (err) {
      responseData = {
        status: "400",
        message: err,
        data:{}
      }
      return res.json(responseData);
      
    }

    if (results.length > 0)
      { 
      responseData = {
          status: "400",
          message:"This designation name already exist",
          data:{}
      }
      return res.json(responseData);
    } 
  });
  // Insert the designation with status set to true
  const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
  db.query(
    'INSERT INTO designation (name, created_at) VALUES (?, ?)',
    [name, created_at], // Set status to true for new entries
    (err, results) => {
      if (err){
        responseData = {
            status: "500",
            message: err,
           data:{}
        }
        return res.json(responseData);
 
      } else {
        responseData = {
          status: "200",
          message:"designation saved successfully",
          data:{
            id: results.insertId
          }
        }
        return res.json(responseData);
      }
    }
  );
});
// Update designation
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (name == ""){
    //return res.status(404).json({ error: 'Please provide name' });
    responseData = {
      status: "200",
      message:"Please provide name",
      data:{}
  }
  
  return res.json(responseData);
  }
  // Check if the designation exists by id
  db.query('SELECT * FROM designation WHERE id = ?', [id], (err, results) => {
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
            //department: results[0]
          }
     }
     return res.json(responseData);
    // Check if the designation name is unique or not
    db.query('SELECT * FROM designation WHERE name = ? AND id != ?', [name, id], (err, nameResults) => {
      if (err) return res.status(500).send(err); // Handle database errors

      if (nameResults.length > 0) {
        return res.status(409).json({ error: 'Branch Name already exists' }); 
      }

      // updation if the designation exists
      db.query('UPDATE designation SET name = ? WHERE id = ?', [name, id], (err) => 
        {
        responseData = {
          status: "200",
          message:"Record found",
          data:{results}
      }
      return res.json(responseData);
      responseData = {
          status: "400",
          message:"Record not found",
          data:{}
      }
      return res.json(responseData);
        
      });
    });
  });
});

// Delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // Check if the user exists
  db.query('SELECT * FROM designation WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) 
      {
        return res.status(404).send('sorry branch not found');
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
            designation: results[0]
          }
      }

    // Proceed with deletion if the branch exists
    db.query('UPDATE designation SET status=0 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).send(err);
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
      res.send('designation deleted successfully');
    });
  });
});
module.exports = router;

// const express = require('express');
// const router = express.Router();
// const db = require('../db');
// const moment = require('moment');

// // Get all employees
// router.get('/', (req, res) => {
//   const getDetailsQuery = `
//           SELECT 
//             e.id, e.employee_id, e.name, e.email, e.phone, e.doj, 
//             d.name AS department_name, 
//             des.name AS designation_name, 
//             b.name AS branch_name
//           FROM employee e
//           JOIN department d ON e.department_id = d.id
//           JOIN designation des ON e.designation_id = des.id
//           JOIN branch b ON e.branch_id = b.id
//         `;
//   //db.query('SELECT * FROM employee', (err, results) => {
//     db.query(getDetailsQuery, (err, results) => {
//     if (err) return res.status(500).send(err);
//     res.json(results);
//   });
// });

// // Get an employee by ID
// router.get('/:id', (req, res) => {
//   var responseData = {};
//   const { id } = req.params;
//   const getDetailsQuery = `
//           SELECT 
//             e.id, e.employee_id, e.name, e.email, e.phone, e.doj, 
//             d.name AS department_name, 
//             des.name AS designation_name, 
//             b.name AS branch_name
//           FROM employee e
//           JOIN department d ON e.department_id = d.id
//           JOIN designation des ON e.designation_id = des.id
//           JOIN branch b ON e.branch_id = b.id
//           WHERE e.id = ?
//         `;
//   //db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
//     db.query(getDetailsQuery, [id], (err, results) => {
//     if (err) return res.status(500).send(err);

//     if (results.length === 0) {
//       //return res.status(404).json({ status: "404", message: "Employee not found", data: {} });
//       responseData = {
//         status: "400",
//         message:"Record not found",
//         data:{}
//     }
//     return res.json(responseData);
//     }

//     responseData = {
//       status: "200",
//       message:"Get all records",
//       data:{
//         department: results[0]
//       }
//   }
//   res.json(responseData);
// });
// });

// // Create a new employee
// // router.post('/', (req, res) => {
// //   const {
// //     employee_id, name, email, phone, emergency_contact, doj, gender, blood_group, 
// //     department_id, designation_id, branch_id, address, account_num, manager_id
// //   } = req.body;

// //   // Validate required fields
// //   if (!employee_id || !name || !email || !phone || !doj || !gender || !department_id || !designation_id || !branch_id) {
// //     return res.status(400).json({ error: 'Missing required fields' });
// //   }

// //   // Check for duplicate employee_id
// //   db.query('SELECT * FROM employee WHERE employee_id = ?', [employee_id], (err, results) => {
// //     if (err) return res.status(500).send(err);

// //     if (results.length > 0)//At least one record in the database matches the condition (ex.another record has the same name)
// //       {
// //       return res.status(409).json({ error: 'Employee ID already exists' });
// //     }

// //     const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
// //     db.query(
// //       'INSERT INTO employee (employee_id, name, email, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
// //       [employee_id, name, email, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id, created_at, 1],
// //       (err, results) => {
// //         if (err) return res.status(500).send(err);
// //         res.status(201).json({ id: results.insertId, employee_id, name });
// //       }
// //     );
// //   });
// // });

// // Create a new employee
// router.post('/', (req, res) => {
//   const {
//     employee_id, name, email, phone, emergency_contact, doj, gender, blood_group, 
//     department_id, designation_id, branch_id, address, account_num, manager_id
//   } = req.body;

//   // Validate required fields
//   if (!employee_id || !name || !email || !phone || !doj || !gender || !department_id || !designation_id || !branch_id) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   // Check for duplicate employee_id
//   db.query('SELECT * FROM employee WHERE employee_id = ?', [employee_id], (err, results) => {
//     if (err) return res.status(500).send(err);

//     if (results.length > 0) {
//       return res.status(409).json({ error: 'Employee ID already exists' });
//     }

//     const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
//     const insertQuery = `
//       INSERT INTO employee (
//         employee_id, name, email, password,phone, emergency_contact, doj, gender, blood_group, 
//         department_id, designation_id, branch_id, address, account_num, manager_id, created_at, status
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
//     `;
//     db.query(
//       insertQuery,
//       [employee_id, name, email,password, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id, created_at, 1],
//       (err, results) => {
//         if (err) return res.status(500).send(err);

//         db.query(getDetailsQuery, [results.insertId], (err, details) => {
//           if (err) return res.status(500).send(err);
//           res.status(201).json(details[0]);
//         });
//       }
//     );
//   });
// });

// // Update an employee
// router.put('/:id', (req, res) => {
//   const { id } = req.params;
//   const {
//     name, email, phone, emergency_contact, doj, gender, blood_group, 
//     department_id, designation_id, branch_id, address, account_num, manager_id
//   } = req.body;

//   db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
//     if (err) return res.status(500).send(err);

//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
//     db.query(
//       'UPDATE employee SET name = ?, email = ?, phone = ?, emergency_contact = ?, doj = ?, gender = ?, blood_group = ?, department_id = ?, designation_id = ?, branch_id = ?, address = ?, account_num = ?, manager_id = ?, updated_at = ? WHERE id = ?',
//       [name, email, phone, emergency_contact, doj, gender, blood_group, department_id, designation_id, branch_id, address, account_num, manager_id, updated_at, id],
//       (err) => {
//         if (err) return res.status(500).send(err);
//         res.send('Employee updated successfully');
//       }
//     );
//   });
// });

// //delete an employee
// router.delete('/:id', (req, res) => {
//   const { id } = req.params;

//   db.query('SELECT * FROM employee WHERE id = ?', [id], (err, results) => {
//     if (err) return res.status(500).send(err);

//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }
// // Proceed with deletion if the employees
//     db.query('UPDATE employee SET status = 0 WHERE id = ?', [id], (err) => {
//       if (err) return res.status(500).send(err);
//       res.send('Employee deleted successfully');
//     });
//   });
// });
// module.exports = router;