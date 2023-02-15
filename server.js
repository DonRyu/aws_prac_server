const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { uploadFile, getFileStream,deleteFile } = require("./s3");
const { getConnect } = require("./database");
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/images/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

app.post("/setImage", upload.single("img"), async (req, res) => {
  const file = req.file;
  const result = await uploadFile(req.file);
  await unlinkFile(file.path);
  if (result.key) {
    await getConnect((conn) => {
      conn.query(
        `insert into img_table (ImgKey) values ('${result.key}')`,
        (err) => {
          if (err) {
            console.log("=====connect", err);
          } else [res.send({ message: "success" })];
        }
      );
      conn.release();
    });
  } else {
    res.status(500);
  }
});

app.post("/getImages", async (req, res) => {
  await getConnect((conn) => {
    conn.query("select * from img_table", (err, results) => {
      let = images = results.map((item) => {
        return item.ImgKey;
      });
      res.send(images);
    });
    conn.release();
  });
});

app.post("/deleteImage", async (req, res) => {
  const isDeletedFromS3 = deleteFile(req.body.key);
  if (!isDeletedFromS3) {
    return res.send({ message: "s3 error" });
  }
  await getConnect((conn) => {
    conn.query(
      `delete from img_table where ImgKey ='${req.body.key}'`,
      (err, results) => {
        if (err) {
          console.log("=====>connect", err);
        } else {
          res.send({ message: "delete success" });
        }
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});