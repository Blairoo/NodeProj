const express = require('express');
const app = express();
const body = require('body-parser');
const { read } = require('fs');
app.use( body.urlencoded( { extended:false } ) );
app.use( body.json() );

const multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
const path = require("path");
// 파일명 앞에 시간을 정수로 달아줌
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + "_" + Date.now() + ext);
    }
});
// 미들웨어, 앞서 만든 storage를 넣어서 저장될 파일 이름 유지
const upload = multer({ storage: storage });
// dest는 파일 이름을 무작위로 변경하게 됨
// const upload = multer({ dest: 'uploads/' });
app.use('/upload', express.static(__dirname + '/uploads'));
// 입력한 파일이 uploads/ 폴더 내에 저장된다.
// multer라는 모듈이 함수라서 함수에 옵션을 줘서 실행을 시키면, 해당 함수는 미들웨어를 리턴한다.
const port = 8000;


app.set("view engine", "ejs");
// views는 내가 설정한 폴더 이름
app.set("views", __dirname + "/views");
// nodejs의 static
app.use('/test', express.static(__dirname + "/static"));
// express 모듈에서 정적파일을 관리하는 폴더, 내 프로젝트의 static폴더에서 관리하겠다는 것

app.get('/', (req, res) => {
    res.send("안녕get");
});
app.get('/test', (req, res) => {
    // 확장자 빼고 만든 test.ejs의 이름만 입력, 불러오는 것
    res.render('test', {para: 5, para2: "cherry"});
});
app.get('/form', (req, res) => {
    res.render('form');
});
app.post('/form', function(req, res){
    console.log(req);
    console.log(req.body);
    console.log("post form 들어옴");
    res.send("hi");
});

app.get('/regform', (req, res) => {
    res.render('regform');
});
app.post('/complete', upload.single('img'), function(req, res){
    console.log(req.body);
    console.log("post form 들어옴");
    console.log(req.file);
    res.render('comreg', {name: req.body.name, id: req.body.id, pw: req.body.pw, phone: req.body.phone, img: req.file.filename});
});

app.listen(port, () => {
	console.log("8000!");
});