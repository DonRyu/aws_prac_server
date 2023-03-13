const { getConnect } = require("../database");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// review_id, user_id,movie_id, rating, comment
const setRate = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const userData = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("req", req.body);
    console.log("userData", userData);

    getConnect().then((conn) => {
      conn.query(
        `INSERT INTO REVIEW (user_id,movie_id,rating) VALUES ('${userData.user_id}',${req.body.movie_id},${req.body.rate})
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
        (err, records) => {
          if (err) {
            res.setStatus(500);
          }
        }
      );
      conn.release();
    });
  } catch (error) {
    req.cookie("accessToken", "");
    req.cookie("nickname", "");
    res.send(false);
  }
};

const getRate = (req, res) => {};

module.exports = {
  setRate,
  getRate,
};
