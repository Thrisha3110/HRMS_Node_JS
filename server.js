const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const moment = require('moment');
const cors = require('cors');

// const server=http.createServer((req,res)=>{
// res.end(req.url);
// });

const app = express();
app.get('/api/hello', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

//app.use(cors());
//app.use(bodyParser.json());


// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Root@123',
//     database: ''
// });
// db.connect((err) => {
//     if (err) {
//         console.error('Database connection failed:', err);
//         return;
//     }
//     console.log('Connected to the database.');
// });
// app.post('/Branch', (req, res) => {
//     const{name}=req.body
    
//     const currentdate = moment().format("YYYY-MM-DD HH:mm:ss")
//     const sql='INSERT INTO Branch(id,name,created_at)VALUES(?, ?, ?)';
//     db.query(sql,[id,name,currentdate],(err,result)=>{
//         if (err) {
//             return res.status(500).send(err);
//           }
//           res.status(201).json({ message: 'User created', userId: result.insertId });
//         });
//       });

// app.post('/Department', (req, res) => {
//         const{name}=req.body
        
//         const currentdate = moment().format("YYYY-MM-DD HH:mm:ss")
//         const sql='INSERT INTO Department(id,name,created_at)VALUES(?, ?, ?)';
//         db.query(sql,[id,name,currentdate],(err,result)=>{
//             if (err) {
//                 return res.status(500).send(err);
//               }
//               res.status(201).json({ message: 'User created', userId: result.insertId });
//             });
//           });
// app.post('/Designation', (req, res) => {
//     const{name}=req.body
    
//     const currentdate = moment().format("YYYY-MM-DD HH:mm:ss")
//     const sql='INSERT INTO Designation(id,name,created_at)VALUES(?, ?, ?)';
//     db.query(sql,[id,name,currentdate],(err,result)=>{
//         if (err) {
//             return res.status(500).send(err);
//             }
//             res.status(201).json({ message: 'User created', userId: result.insertId });
//         });
// });
