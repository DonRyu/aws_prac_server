require("dotenv").config();
let mysql = require("mysql");
let pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

function getConnect() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if(err){
        console.log('conn error',err)
        return reject(err)
      }
      resolve(conn)
    });
  });
}

exports.getConnect = getConnect;
