const express = require('express');
const app = express();
const body = require('body-parser');
const fs = require('fs');
const Swal = require('sweetalert2');
app.use( body.urlencoded( { extended:false } ) );
app.use( body.json() );

const session = require('express-session');
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: true,
}));

const multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + "_" + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(__dirname + '/uploads'));

const port = 8000;
const http = require("http").Server(app);
const io = require("socket.io")(http); // 이 문장 하나로 소켓에서 이벤트가 발생하기를 기다리는 상태

app.set("view engine", "ejs");
// views는 내가 설정한 폴더 이름
app.set("views", __dirname + "/views");
// nodejs의 static
app.use(express.static(__dirname + "/public"));
// moment-timezone
var moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul"); 

app.get("/list",(req,res) => {
    res.render("roomlist");
});

app.get("/chat",(req,res) => {
    res.render("socket");
});

// roomName을 param으로 받아서 params 이름의 방을 만들기
app.get("/chat/:roomName", getRoomName);
let room_array=[];
var roomName;
function update_rooms(roomName){
    room_array.push(roomName);
    console.log("저장하는방이름"+roomName);
    console.log(room_array);
}
function getRoomName(req,res){
	roomName = req.params.roomName;
    console.log("파람룸네임"+req.params.roomName);
    const indexRoom = room_array.findIndex((e) => e === roomName);
    if(indexRoom < 0){
        update_rooms(roomName);
        res.render("socket", {roomName: roomName});
    }else{
        res.render("socket", {roomName: roomName});
    }
}
let nick_array = [];

let clients;
let update_list;
// function update_list() {
update_list = function(clients) {
    let nicks = [];
    // for ( let socket in nick_array ){
    //     nicks.push(nick_array[socket]);
    // }
    // clients= Array.from(io.sockets.adapter.rooms.get(roomName));
    console.log(clients);
    console.log("nicks");
    for(var i in clients){
        var client = clients[i];
        nicks.push(nick_array[client]);
        console.log(nicks);
    }
    io.emit( "update_nicks", {nlist: nicks});
    console.log(nick_array);
    console.log("닉---"+nicks);
}

io.on("connection", function(socket){
    // socket과 관련한 통신 작업을 모두 처리하는 함수(채팅 보내고 받는 것을 처리하는 것)
    console.log("Socket connected")
    const socketId = socket.id;
    nick_array[socketId] = socketId;
    // update_list();
    console.log("룸네임-----"+roomName);
    io.to(socketId).emit("mySocket", {id: socketId, nick: nick_array[socketId]});
    // 보낼 때는 socket.emit
    socket.on("joinRoom", (data) => {
        // function getRooms(io){
        //     const arr = Array.from(io.sockets.adapter.rooms);
        //     const filtered = arr.filter(room => !room[1].has(room[0]));
        //     const res = filtered.map(i => i[0]);
        //     console.log(res);
        //     return res;
        // }
        // getRooms(io);
        console.log("조인룸데이터");
        console.log(data);
        socket.join(data.roomName); // 특정 room에 들어가는 것
        roomName = data.roomName;
        clients= Array.from(io.sockets.adapter.rooms.get(roomName));
        console.log(clients);
        // console.log(JSON.stringify( Array.from(clients)));
        // let aha=Array.from(clients);
        // stringify parse

        // console.log(clients.size);
        update_list(clients);
        io.in("roomList").emit( "update_rooms", {rlist: room_array});
        // io.emit('notice', {notice: socketId + "님이 들어왔습니다."})
        io.in(roomName).emit('notice', {notice: socketId + "님이 들어왔습니다.", clients: clients});
    });
    socket.on('reqMsg', (data) => {
        console.log(data);
        if(data.who){
            console.log("dm메세지");
            for(var i in nick_array){
                if(nick_array[i]==data.who){// i는 socketid, i로 nick을 index하는 것
                    var dmid = i;
                    console.log(i);
                    break;
                }
            }
            io.sockets.to(dmid).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), dm: true, session: data.session});
            io.sockets.to(socketId).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), dm: true, session: data.session});
        // 전체
        }else{
            console.log("전체메세지");
            console.log(data.session);
            io.sockets.in(data.roomName).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), session: data.session});
        }
    });
    // 클라이언트 종료하면 자동 disconnect 됨
    socket.on("disconnect", ()=> {
        console.log("disconnect: "+socketId);
        // io.emit('notice', {notice: nick_array[socketId] + "님이 나갔습니다."});
        io.to(roomName).emit('notice', {notice: nick_array[socketId] + "님이 나갔습니다.", clients: clients});
        delete nick_array[socketId];
        socket.leave(roomName);
        update_list();
    });
})
// ajax nick 중복 검사
app.post('/ajaxNick', function(req, res){
    var nick = req.body.nick;
    var socketId = req.body.socketId;
    var responseData = {};
    console.log("저장전");
    console.log("소켓아이디"+socketId);
    console.log(nick_array[socketId]);
    console.log(nick_array);
    // 중복된 닉네임이 없을 때
    if (Object.values(nick_array).indexOf(nick) < 0){
        // socketId의 닉네임과 새 닉네임이 같지 않을 때
        if (nick_array[socketId] != nick){
            nick_array[socketId] = nick;
            console.log(Object.values(nick_array).indexOf(nick));
            console.log("소켓아이디"+socketId);
            console.log("닉어레이소켓아이디"+nick_array[socketId]);
            console.log(nick + "저장 성공")
            io.to(socketId).emit("mySocket", {id: socketId, nick: nick_array[socketId]});
            responseData.nick = nick;
            responseData.result = "success";
            res.json(responseData);
            // data를 보내고 나서 updatelist 하는 법?
            update_list(clients);
        }
    }else{
        if (nick_array[socketId]  == nick){
            responseData.result = "same";
            res.json(responseData);
        }else{
            console.log("exist nick");
            responseData.nick = nick;
            responseData.result = "fail";
            res.json(responseData);
        }
    }
});
// upload pic
app.post('/ajaxPic',upload.single('pic'), function(req, res){
    console.log(req.file);
    console.log(req.session);
    var responseData = {};
    if (req.session.prof){
        console.log("두번째바꿈")
        fs.unlink(`./uploads/${req.session.prof}`, function (err) {
            if (err) throw err;
            console.log("file deleted!");
        });
        req.session.prof = req.file.filename;
        console.log(req.session);
        responseData.session = req.session.prof;
        responseData.result = "success";
        res.json(responseData);
    }else {
        console.log("처음바꿈");
        req.session.prof = req.file.filename;
        console.log(req.session);
        responseData.session = req.session.prof;
        responseData.result = "success";
        res.json(responseData);
    }
});
// ajax room 중복 검사
app.post('/ajaxRoom', function(req, res){
    var room = req.body.room;
    var responseData = {};
    console.log("저장전");
    // 중복된 room이 없을 때
    const indexRoom = room_array.findIndex((e) => e === room);
    console.log(indexRoom);
    if(indexRoom < 0){//중복 X
        update_rooms(room);
        console.log(room + "저장 성공");
        console.log(room_array);
        io.emit( "update_rooms", {rlist: room_array});
        responseData.room = room;
        responseData.result = "success";
        res.json(responseData);
    }else{//중복
        console.log("exist room");
        responseData.room = room;
        responseData.result = "fail";
        res.json(responseData);
    }
});
// ajax remove room
app.post('/ajaxDelList', function (req,res){
    var delRoom = req.body.delRoom;
    var responseData = {};
    const indexRoom = room_array.findIndex((e) => e === delRoom);
    console.log(indexRoom);
    for(let i = 0; i < room_array.length; i++){
        if(room_array[i] === delRoom){
            room_array.splice(i, 1);
            io.emit( "update_rooms", {rlist: room_array});
            console.log(i);
            responseData.result = "success";
            res.json(responseData);
            break;
        }
    }
});

http.listen(port, () => {
	console.log("8000!");
});