// express app
var express = require("express")
var app = express()
var db = require("./database.js")
var bcrypt = require("bcryptjs")
var jwt = require("jsonwebtoken")

var cors = require('cors')
var corsOptions = {
    credentials: true,
    origin: "http://localhost:8080"
};  
app.use(cors(corsOptions));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var multer  = require('multer')

// key for jwt
const SECRET_KEY = "a1d2m3in4"

// Server port
var HTTP_PORT = 3000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`)
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// api for getting all users
app.get("/api/users", (req, res, next) => {
    var sql = "SELECT * FROM user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// api for updating user
app.patch("/api/user", (req, res, next) => {
    var data = {
        firstname: req.body.firstname ? req.body.firstname : null,
        lastname: req.body.lastname ? req.body.lastname : null,
        middlename: req.body.middlename ? req.body.middlename : null,
        phone: req.body.phone ? req.body.phone : null,
        email: req.body.email ? req.body.email : null
    }
    db.run(
        `UPDATE user set 
           firstname = ?, 
           lastname = ?,
           middlename = ?,
           phone = ?,
           email = ?
           WHERE id = ?`,
        [data.firstname, data.lastname, data.middlename, data.phone, data.email, req.body.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

//api for deleting user
app.delete("/api/user", (req, res, next) => {
    console.log(req.body)
    db.run(
        `DELETE FROM user
           WHERE id = ?`,
        [req.body.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                message: "success"
            })
    });
})

// api for creating user
app.post("/api/user", (req, res, next) => {
    var data = {
        firstname: req.body.firstname ? req.body.firstname : null,
        lastname: req.body.lastname ? req.body.lastname : null,
        middlename: req.body.middlename ? req.body.middlename : null,
        phone: req.body.phone ? req.body.phone : null,
        email: req.body.email ? req.body.email : null
    }
    db.run(
        `INSERT INTO user (firstname, lastname, middlename, phone, email) VALUES (?,?,?,?,?)`,
        [data.firstname, data.lastname, data.middlename, data.phone, data.email],
        function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                message: "success"
            })
    });
})

// api for admin authentication
app.post("/api/admin/login", multer().none(), (req, res, next) => {
    var sql = "SELECT * FROM admin WHERE login  = ?"
    var params = [req.body.username]
    db.get(sql, params, (err, admin) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (!admin) return res.status(404).send();

        // password validation
        const result = bcrypt.compareSync(req.body.password, admin.password);
        if (!result) return res.status(401).send();

        // time of token expiration
        const expiresIn = 1000 * 60 * 10;
        // token 
        const accessToken = jwt.sign({ id: admin.id }, SECRET_KEY, {
            expiresIn: expiresIn
        });
        res.status(200).send({ "admin": admin.login, "access_token": accessToken, "expires_in": expiresIn })

        
      });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});