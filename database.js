require("dotenv").config();
let mysql = require("mysql");
let pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

function getConnect(callback) {
  pool.getConnection((err, conn) => {
    if (!err) {
      callback(conn);
    } else {
      console.log("RDS CONNECT ERROR =====>",err);
    }
  });
}

exports.getConnect = getConnect;
