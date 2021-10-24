const express = require('express');
const app = express();
const mysql = require( 'mysql' );

app.set("view engine", "ejs");
// views는 내가 설정한 폴더 이름
app.set("views", __dirname + "/views");
// nodejs의 static
app.use(express.static(__dirname + "/public"));
// moment-timezone
var moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul"); 

const conn = mysql.createConnection({
	user: 'root',
	password: 'sae1299**',
	database: 'node'
});

app.get( '/test', ( req, res ) => {
	const sql = "SELECT * FROM member";
	
	conn.query( sql, function( err, results ){
		res.render( 'test', { param1: results } );
	});
});

app.get('/main', (req, res) => {
    res.render('main')
});

app.post('/main', (req, res) => {
    /* insert 예제 */
    const sql = `INSERT INTO User(username, userid, userpw, userphone, registered) VALUES('탐', 'tam', 'sae1299**', '01088889999', '${moment().format("YYYY-MM-DD")}');`;
    conn.query(sql, function(err){
        if(err){
            console.log('failed!:' + err);
        }
        else{
            console.log("data inserted!");
        }
    });
    res.render('main')
});

app.get('/exhibition', (req, res) => {
	res.render('list')
});

// app.get('/exhibition', (req, res) => {
// 	res.render('list')
// })
app.listen( 8000, function () {
	// console.log(conn.state) // db에 접속이 되었는지 확인 -> 연결 확인이 아닌거 같음 계속 disconnected 뜸
	conn.connect((err) => {
		if (err) console.log(err);
		else console.log("connect success!");
	});
	// if (conn) console.log("Listening on *:8000");
	// else console.log("DB connection error");

	/* select 예제 */
	// const sql = "SELECT * FROM 테이블명 WHERE 컬럼1 = 값;";
	// conn.query(sql, function(err, results){
	// 	for(var i = 0; i < results.length; i++){
	// 		console.log(results[i]["컬럼"]);
	// 	}
	// });
});