const express = require('express');
const app = express();
const body = require('body-parser');
const { read } = require('fs');
const Swal = require('sweetalert2');
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
    io.emit( "update_nicks", {nlist: nicks});
    console.log(nick_array);
    console.log("닉---"+nicks);
}
// 아래 "connection"은 정해져 있는 이벤트, (socket)socket 안에 누가 요청했는지 들어감
io.on("connection", function(socket){
    // socket과 관련한 통신 작업을 모두 처리하는 함수(채팅 보내고 받는 것을 처리하는 것)
    console.log("Socket connected")
    const socketId = socket.id;
    nick_array[socketId] = socketId;
    update_list();

    io.to(socketId).emit("mySocket", {id: socketId, nick: nick_array[socketId]});
    // 보낼 때는 socket.emit
    socket.on("joinRoom", (data) => {
        console.log(data);
        socket.join(data.roomName); // 특정 room에 들어가는 것
        roomName = data.roomName;
        const clients= io.sockets.adapter.rooms.get(roomName);
        console.log(clients.size);
        update_list();
        io.emit('notice', {notice: socketId + "님이 들어왔습니다.", count: clients.size})
    });
    socket.on('reqMsg', (data) => {
        console.log(data);
        // 데이터를 보낼 때도 특정 room으로 보내는 것, 내가 등록한 room으로만 보낼 수 있음, room에 접속한 모든 사람 볼 수 있음
        // 서버에 접속한 모든 소켓들의 정보가 io에 저장됨, io.emit은 접속한 모든 클라이언트에 보내는 것
        // dm 넘어올 때
        if(data.who){
            console.log("dm메세지");
            // const who = Object.values(nick_array).indexOf(data.who);
            // const whoo = Object.keys(nick_array).reduce(function(filtered, key){
            //     if(data.who.includes(nick_array[key]))
            //     filtered[key] = nick_array[key];
            //     return filtered;
            // }, {});
            // console.log(whoo);
            // console.log(who);
            for(var i in nick_array){
                if(nick_array[i]==data.who){
                    var dmid = i;
                    console.log(i);
                    break;
                }
            }
            io.sockets.to(dmid).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), dm: true});
            io.sockets.to(socketId).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), dm: true});
            //room에서는 to가 안됨? => room 자체가 to(roomName)해도 됨
            // io.sockets.in(roomName).to(dmid).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), dm: true});
            // io.sockets.broadcast(dmid).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A"), dm: true});
        // 전체
        }else{
            console.log("전체메세지")
            io.sockets.in(roomName).emit('recMsg', {id: socketId, nick: nick_array[socketId], msg: data.comment, time: moment().format("HH:mm A")});
        }
    });
    // disconnect하면서 리스트에 있는 socket.id도 지우는 법
    // socket.on( "disconnect", function () {
    //     console.log( "user disconnected: ", socket.id );
    //     io.emit( "notice", `${nick_array[socket.id]}님이 퇴장하셨습니다.`)
    //     delete nick_array[socket.id];
    //     update_list();
    // });
    // 승민님
    // socket.on("disconnect",()=>{
    //     let len=ulist.length;
    //     for( var i = 0; i < len; i++){ 
    //         if ( ulist[i].id === socket.id) { 
    //             let user=ulist[i];
    //             left_ulist.push(user);
    //             ulist.splice(i, 1);
    //             break;
    //         }
    //     io.emit("notice",`${socket.id}님 도망감`);
    //     newulist();
    //     };
    // });
    // 클라이언트 종료하면 자동 disconnect 됨
    socket.on("disconnect", ()=> {
        console.log("disconnect: "+socketId);
        const clients= io.sockets.adapter.rooms.get(roomName);
        io.emit('notice', {notice: nick_array[socketId] + "님이 나갔습니다.", count: clients.size});
        delete nick_array[socketId];
        socket.leave(roomName);
        update_list();
    })
})
// ajax nick 중복 검사
app.post('/ajax', function(req, res){
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
            update_list();
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


http.listen(port, () => {
	console.log("8000!");
});