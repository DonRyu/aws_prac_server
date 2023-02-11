const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const multer = require("multer");
const app = express();

const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));



const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "Images");
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});

const upload = multer({storage:storage})

app.post("/image", upload.single("img"), (req, res) => {
  res.json({
    message: "Image uploaded successfully.",
  });
});

app.post("/test", (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
