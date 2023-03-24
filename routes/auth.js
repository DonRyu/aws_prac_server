const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { getConnect } = require("../models/database");

router.post("/login", (req, res) => {
  let validInfo = {};
  getConnect().then((conn) => {
    conn.query("SELECT * FROM USER", (err, records) => {
      validInfo = records.find((item) => {
        return (
          item.user_id === req.body.user_id &&
          item.password === req.body.password
        );
      });
      if (validInfo) {
        setCookie(validInfo, res);
      } else {
        res.json({ error: "Please type correct information" });
      }
    });
    conn.release();
  });
});

const setCookie = (validInfo, res) => {
  try {
    const accessToken = jwt.sign(
      {
        user_id: validInfo.user_id,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "24h",
        issuer: "Don Ryu",
      }
    );

    res.cookie("accessToken", accessToken, {
      secure: false, // http만 사용
      httpOnly: false, // js 에서 cookie 접근 불가
    });
    res.cookie("nickname", validInfo.nickname, {
      secure: false, // http만 사용
      httpOnly: false, // js 에서 cookie 접근 불가
    });

    res.status(200).send("login success");
  } catch (error) {
    res.status(500).json(error);
  }
};

router.post("/isLogined", (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const userData = jwt.verify(token, process.env.ACCESS_SECRET);
    res.send(true);
  } catch (error) {
    res.send(false);
  }
});

router.post("/logout", (req, res) => {
  // try {
  //   req.cookie("accessToken", "");
  //   req.cookie("nickname", "");
  //   res.status(200).json("logout success");
  // } catch (error) {
  //   res.status(500).json(error);
  // }
});

router.post("/signUp", (req, res) => {
  //console.log('res',req.body)
  //INSERT INTO USER(user_id,nickname,password)VALUES('test3@gmail.com','test3','asdf1234');

  getConnect().then((conn) => {
    conn.query(`SELECT user_id,nickname FROM USER`, (err, records) => {
      let isID = records.find((item) => {
        return item.user_id === req.body.email;
      });
      let isNickName = records.find((item) => {
       return item.nickname === req.body.nickname
      });

      if (isID) {
        res.send({ error: "Email is already used" });
        return;
      }
      if (isNickName) {
        res.send({ error: "Nickname is already used" });
        return;
      }
      res.send(true)

    });
    conn.release();
  });
});

router.post("/verify", (req, res) => {
  console.log("req.body", req.body);
});

router.get("/test", (req, res) => {
  res.send("sibar");
});

module.exports = router;
