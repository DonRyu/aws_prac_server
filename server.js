const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const app = express();
const port = 8080;
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "Images");
  },
});
const { uploadFile, getFileStream } = require("./s3");
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

app.post("/image", upload.single("img"), async (req, res) => {
  const file = req.file;
  const result = await uploadFile(req.file);
  await unlinkFile(file.path);
  if (result.key) {
    res.send({ imagePath: `/images/${result.key}` });
  } else {
    res.status(500);
  }
});

app.post("/test", (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
