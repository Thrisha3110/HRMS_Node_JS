const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');

// Get all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM department' , (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results) ; 
  }); 
});

router.get('/backup-data', (req, res) => {
  db.query('SELECT * FROM department ', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results) ; 
  }); 
})

// Get a user by ID
router.get('/:id', (req, res) => {
  var responseData = {};
  const { id } = req.params;
  db.query('SELECT * FROM department WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0){
      //return res.status(404).send('sorry branch not found');
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
    res.json(responseData);
  });
});
// Create a new user
router.post('/', (req, res) => {
  const {name} = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  // Check if the name already exists for a different record
  db.query('SELECT * FROM department WHERE name = ?', [name], (err, results) => {
    
    if (err) return res.status(500).send(err);

    if (results.length > 0) //At least one record in the database matches the condition (ex.another record has the same name)
    {
      return res.status(409).json({ error: 'department Name already exists' });
    }
  });
  // Insert the branch with status set to true
  const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
  db.query(
    'INSERT INTO department (name, created_at) VALUES (?, ?)',
    [name, created_at], // Set status to true for new entries
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(201).json({ id: results.insertId, name });
    }
  );
});
// Update a user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (name == "") 
    {
    return res.status(404).json({ error: 'Please provide department name' });
    }
// Check if the branch exists by id
db.query('SELECT * FROM department WHERE id = ?', [id], (err, results) => {
  if (err) return res.status(500).send(err);

  if (results.length === 0) {
    return res.status(404).json({ error: 'department with given id not found' });
  }
// Check if the branch name is unique or not
db.query('SELECT * FROM department WHERE name = ? AND id != ?', [name, id], (err, nameResults) => {
  if (err) return res.status(500).send(err); // Handle database errors

  if (nameResults.length > 0) {
    return res.status(409).json({ error: 'department Name already exists' }); 
  }

  // Proceed with updation if the branch exists
  db.query('UPDATE department SET name = ? WHERE id = ?', [name, id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('User updated successfully');
  });
});
  
});
});
// Delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // Check if the user exists
  db.query('SELECT * FROM department WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) 
      {
      return res.status(404).json({ error: 'department not found' });
      }

    // Proceed with deletion if the branch exists
    db.query('UPDATE department SET status=0 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).send(err);
      res.send('department deleted successfully');
    });
  });
});
module.exports = router;

