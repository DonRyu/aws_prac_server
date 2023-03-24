const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const { uploadFile, getFileStream, deleteFile } = require("./models/s3");
const { getConnect } = require("./models/database");
const app = express();
const port = 8080;
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "Images");
  },
});
const upload = multer({ storage: storage });
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const auth = require('./routes/auth');
const rate = require('./routes/rate');
const test = require('./routes/test');


app.use(cors({
    origin: ['http://localhost:3000'], // 출처 허용 옵션
    credentials: true // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth',auth)
app.use('/rate',rate)
app.use('/test',test)


app.get("/api/images/:key", async (req, res) => {
  const key = req.params.key;
  try {
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log("err=======>");
  }
});

app.post("/api/setImage", upload.single("img"), async (req, res) => {
  const file = req.file;
  const result = await uploadFile(req.file);
  await unlinkFile(file.path);
  getConnect().then((conn) => {
    conn.query(
      `insert into img_table (ImgKey) values ('${result.key}')`,
      (err) => {
        if (err) {
          return console.log("RDS set error===>", err);
        } else {
          res.send({ message: "success" });
        }
      }
    );
    conn.release();
  });
});

app.post("/api/getImages", async (req, res) => {
  getConnect().then((conn) => {
    conn.query("select * from img_table", (err, results) => {
      if (err) {
        return console.log("RDS delete error===>", err);
      }
      let = images = results.map((item) => {
        return item.ImgKey;
      });
      res.send(images);
    });
    conn.release();
  });
});

app.post("/api/deleteImage", async (req, res) => {
  let isDeletedAtS3 = await deleteFile(req.body.key);
  console.log("isDeletedAtS3", isDeletedAtS3);

  if (isDeletedAtS3) {
    getConnect().then((conn) => {
      conn.query(
        `delete from img_table where ImgKey ='${req.body.key}'`,
        (err, results) => {
          if (err) {
            console.log("RDS delete error===>", err);
          }
          res.send("");
        }
      );
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
