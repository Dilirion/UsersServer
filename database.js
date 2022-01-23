var sqlite3 = require('sqlite3').verbose()
var bcrypt = require('bcryptjs')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname text, 
            lastname text,
            middlename text,
            phone text,
            email text)`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO user (firstname, lastname, middlename, phone, email) VALUES (?,?,?,?,?)'
                db.run(insert, ["Иван","Ивнов","Иванович", "11111111", "ivan@example.com"])
                db.run(insert, ["Петр","Петров","Петрович", "11111112", "petr@example.com"])
                db.run(insert, ["Петр","Иванов","Петрович", "11111113", "petri@example.com"])
                db.run(insert, ["Иван","Петров","Иванович", "11111114", "ivanp@example.com"])
            }
        });
          
        db.run(`CREATE TABLE admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login text UNIQUE, 
            password text,
            CONSTRAINT login_unique UNIQUE (login))`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                const hash = bcrypt.hashSync('admin')
                // Table just created, creating one row
                db.run(`INSERT INTO admin (login, password) VALUES ("admin", "${hash}")`)
            }
        });  
    }
});


module.exports = db