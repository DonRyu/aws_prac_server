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
        setCookie(validInfo,res);
      } else {
        res.status(500).json({ message: "User information is wrong" });
      }
    });
    conn.release();
  });
};

const setCookie = (validInfo,res) => {
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

    res.status(200).json("login success");
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

const isLogin = () => {
  try {
    const token = req.cookies.accessToken;
    const data = jwt.verify(token, process.env.ACCESS_SECRET);

    console.log("data", data);

    res.state(200).json(userData);
  } catch (error) {
    res.state(500).json(error);
  }
};

const logout = () => {
  try {
    req.cookie("accessToken", "");
    res.status(200).json("Logout Success");
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  login,
  accessToken,
  refreshToken,
  isLogin,
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
