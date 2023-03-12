const jwt = require("jsonwebtoken");
require("dotenv").config();
const { getConnect } = require("../database");

const login = (req, res) => {
  let userInfo = req.body;
  let validInfo = {};
  getConnect().then((conn) => {
    conn.query("SELECT * FROM USER", (err, records) => {
      validInfo = records.find((item) => {
        return (
          item.email === req.body.email && item.password === req.body.password
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
};

const setCookie = (validInfo, res) => {
  try {
    const accessToken = jwt.sign(
      {
        id: validInfo.id,
        username: validInfo.username,
        email: validInfo.email,
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

    res.status(200).send( "login success");
  } catch (error) {
    res.status(500).json(error);
  }
};

const accessToken = (req, res) => {
  try {
    const token = req.cookies.accessToken;
  } catch (e) {}
};

const refreshToken = (req, res) => {};

const isLogined = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const userData = jwt.verify(token, process.env.ACCESS_SECRET);
    res.send(true);
  } catch (error) {
    res.send(false);
  }
};

const logout = () => {
  try {
    req.cookie("accessToken", "");
    res.status(200).json("logout success");
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  login,
  accessToken,
  refreshToken,
  isLogined,
  logout,
};

// INSERT INTO USER (user_id,nickname,email,password)
// VALUES ('test1','test1','test@gmail.com','testest')

// const refreshToken = jwt.sign(
//   {
//     id: userInfo.id,
//     username: userInfo.username,
//     email: userInfo.email,
//   },
//   process.env.ACCESS_SECRET,
//   {
//     expiresIn: "24h",
//     issuer: "Don Ryu",
//   }
// );
// token 전송
// res.cookie("refreshToken", refreshToken, {
//   secure: false,
//   httpOnly: false,
// });
