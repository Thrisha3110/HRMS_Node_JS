const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
// Get all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM branch' , (err, results) => {
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
db.query('SELECT * FROM branch ', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results) ; 
  }); 
})

// Get a branch by ID
router.get('/:id', (req, res) => {
  var responseData = {};
  const { id } = req.params;
  db.query('SELECT * FROM branch WHERE id = ?', [id], (err, results) => {
    if (err){
      responseData = {
        status: "400",
        message: err,//"branch not found",
        data:{}
      }
      return res.json(responseData);
      //return res.status(500).send(err);
    } 
    if (results.length === 0){
      //return res.status(404).send('sorry branch not found');
      responseData = {
          status: "400",
          message:"branch not found",
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
   //return res.status(400).json({ error: 'Name is required' });
   responseData = {
    status: "400",
    message:"Name is required",
    data:{}
  }
  return res.json(responseData);
  
  }
  // Check if the name already exists for a different record
  db.query('SELECT * FROM branch WHERE name = ?', [name], (err, results) => 
    {
    
    if (err) {
      responseData = {
        status: "400",
        message: err,//"This branch name already exist",
        data:{}
      }
      return res.json(responseData);
      
    }

    if (results.length > 0){ 
      responseData = {
          status: "400",
          message:"This branch name already exist",
          data:{}
      }
      return res.json(responseData);
    } 
  });
  // Insert the branch with status set to true
  const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
  db.query(
    'INSERT INTO branch (name, created_at) VALUES (?, ?)',
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
          message:"Branch saved successfully",
          data:{
            id: results.insertId
          }
        }
        return res.json(responseData);
      }
      

    }
  );
});

// Update a branch
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
  // Check if the branch exists by id
  db.query('SELECT * FROM branch WHERE id = ?', [id], (err, results) => {
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
    // Check if the branch name is unique or not
    db.query('SELECT * FROM branch WHERE name = ? AND id != ?', [name, id], (err, nameResults) => {
      if (err) return res.status(500).send(err); // Handle database errors

      if (nameResults.length > 0) {
        return res.status(409).json({ error: 'Branch Name already exists' }); 
      }

      // updation if the branch exists
      db.query('UPDATE branch SET name = ? WHERE id = ?', [name, id], (err) => 
        {
        responseData = {
          status: "200",
          message:"Record found",
          data:{results}
      }
      return res.json(responseData);
      responseData = {
          status: "400",
          message:"Record nooot found",
          data:{}
      }
      return res.json(responseData);
        //res.send('User updated successfully');
      });
    });
  });
});

// Delete a branch
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // Check if the user exists
  db.query('SELECT * FROM branch WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0)

        {
      //return res.status(404).send('sorry branch not found');
      responseData = {
          status: "400",
          message:"Record not found",
          data:{}
      }
      return res.json(responseData);
    } 
    // Proceed with deletion if the branch exists
    db.query('UPDATE branch SET status = 0 WHERE id = ?', [id], (err) => {
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

          }
     }
     return res.json(responseData);

    });
  });
});
module.exports = router;



