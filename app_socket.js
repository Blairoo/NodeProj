const express = require('express');
const app = express();
const body = require('body-parser');
const { read } = require('fs');
app.use( body.urlencoded( { extended:false } ) );
app.use( body.json() );

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

app.use('/test', express.static(__dirname + "/static"));

app.get("/",(req,res) => {
    res.render("socket");
});

var roomName;
// 참가자 리스트 관리 {소켓아이디: 닉네임}
let nick_array = [];
function update_list() {
    let nicks = [];
    for ( let socket in nick_array ){
        nicks.push(nick_array[socket]);
    }
    io.emit( "update_nicks", nicks );
    console.log(nick_array);
}
// 아래 "connection"은 정해져 있는 이벤트, (socket)socket 안에 누가 요청했는지 들어감
io.on("connection", function(socket){
    // 서버에 접속한 모든 소켓들의 정보가 io에 저장됨, io.emit은 접속한 모든 클라이언트에 보내는 것
    // io.emit()
    // socket과 관련한 통신 작업을 모두 처리하는 함수(채팅 보내고 받는 것을 처리하는 것)
    console.log("Socket connected")
    const socketId = socket.id;
    // 보낼 때는 socket.emit
    socket.on("joinRoom", (data) => {
        console.log(data);
        socket.join(data.roomName); // 특정 room에 들어가는 것
        io.emit('notice', {notice: socketId + "님이 들어왔습니다."})
        roomName = data.roomName;
    });
    socket.on('reqMsg', (data) => {
        console.log(data);
        // console.log(socket.handshake.headers.cookie);
        // 데이터를 보낼 때도 특정 room으로 보내는 것, 내가 등록한 room으로만 보낼 수 있음, room에 접속한 모든 사람 볼 수 있음
        io.sockets.in(roomName).emit('recMsg', {comment: socketId, msg: data.comment, time: moment().format("HH:mm A")});
    });
    // disconnect하면서 리스트에 있는 socket.id도 지우는 법
    // socket.on( "disconnect", function () {
    //     console.log( "user disconnected: ", socket.id );
    //     io.emit( "notice", `${nick_array[socket.id]}님이 퇴장하셨습니다.`)
    //     delete nick_array[socket.id];
    //     update_list();
    // });
    // 클라이언트 종료하면 자동 disconnect 됨
    socket.on("disconnect", ()=> {
        console.log("disconnect")
        io.emit('notice', {notice: socketId + "님이 나갔습니다."})
    })
})


http.listen(port, () => {
	console.log("8000!");
});