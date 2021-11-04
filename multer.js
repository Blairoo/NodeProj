const express = require('express');
const app = express();
const port = 8000;

const multer = require('multer'); // 모듈 불러오기
const path = require("path");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        if (file.mimetype != "image/png"){
            return false;
        }
        console.log(file)
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + "_" + Date.now() + ext);
    }
});
var upload_multer = multer({
    storage: storage
});
app.use('/img', express.static(__dirname + "/uploads"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
    res.render("form");
});

app.post("/upload", upload_multer.single("userfile"), (req, res) => {
    // upload_multer.single 단일파일처리
    // upload_multer.array 다중파일처리
    // upload_multer.field 잘 안씀, 어떤 이름으로 파일을 보낼 지 하나하나 써야 함
    console.log(req.file);
    res.send("Success");
});
app.post("/upload-multiple", upload_multer.array("userfile"), (req, res) => {
    console.log(req.files);//다중 파일이기 때문에 files해야 뜬다
    res.send("Success");
});

app.listen(port, () => {
    console.log(port + "!");
});