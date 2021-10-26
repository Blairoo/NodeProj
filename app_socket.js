const express = require('express');
const app = express();
const body = require('body-parser');
const { read } = require('fs');
app.use( body.urlencoded( { extended:false } ) );
app.use( body.json() );

const port = 8000;
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.set("view engine", "ejs");
// views는 내가 설정한 폴더 이름
app.set("views", __dirname + "/views");
// nodejs의 static
app.use('/test', express.static(__dirname + "/static"));

app.get("/",(req,res) => {
    res.render("socket");
});

var roomName;
io.on("connection", function(socket){
    // socket과 관련한 통신 작업을 모두 처리하는 함수(채팅 보내고 받는 것을 처리하는 것)
    console.log("Socket connected")
    const instanceId = socket.id;
    // 보낼 때는 socket.emit
    socket.on("joinRoom", (data) => {
        console.log(data);
        socket.join(data.roomName); // 특정 room에 들어가는 것
        roomName = data.roomName;
    });
    socket.on('reqMsg', (data) => {
        console.log(data);
        // 데이터를 보낼 때도 특정 room으로 보내는 것, 내가 등록한 room으로만 보낼 수 있음, room에 접속한 모든 사람 볼 수 있음
        io.sockets.in(roomName).emit('recMsg', {comment: instanceId, msg: data.comment + '\n'});
    });
    // 클라이언트 종료하면 자동 disconnect 됨
    socket.on("disconnect", ()=> {
        console.log("disconnect")
    })
})




http.listen(port, () => {
	console.log("8000!");
});