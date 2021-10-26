const express = require('express');
const app = express();
const mysql = require( 'mysql' );
const body = require('body-parser');
const { read } = require('fs');
app.use( body.urlencoded( { extended:false } ) );
app.use( body.json() );

const session = require('express-session');
// const FileStore = require('session-file-store')(session);
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: true,
    // store: new FileStore()
}));
// app.get('/login', (req, res, next) => {
//     console.log(req.session);
//     if(!req.session.num){
//         req.session.num = 1;
//     } else {
//         req.session.num = req.session.num + 1;
//     }
//     res.send(`Number : ${req.session.num}`);
// });
app.get('/logged', (req, res) => {
    if(req.session.logined) {
        res.render('logout', { session: req.session.user_id });
    } else {
        res.render('login');
    }
});

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
    if(req.session.logined) {
        console.log("logged")
        res.render('main', { session: req.session.user_id });
    } else {
        console.log("please login")
        res.render('main', {session: "none"});
    }
});

app.post('/main', (req, res) => {
    // insert
    console.log(req.body)
    if(req.body.user_id){
        const sql = `INSERT INTO User VALUES(NULL, '${req.body.user_name}', '${req.body.user_id}', '${req.body.user_pw}', '${req.body.user_phone}', '${moment().format("YYYY-MM-DD")}');`;

        conn.query(sql, function(err,result){
            if(err){
                console.log('failed!:' + err);
            }
            else{
                console.log("data inserted!");
            }
            const sql_selected = `SELECT * FROM User WHERE pk = "${result.insertId}";`;
            conn.query(sql_selected, (err, results) => {
                console.log(results[0].username);
                // res.render('main', {results: results[0]});
                res.redirect('http://115.85.180.68:8000/main#section-login');
            });
        });
    }

    // select
    if(req.body.login_id){
        const sel = `SELECT * FROM User WHERE userid = '${req.body.login_id}' AND userpw = '${req.body.login_pw}';`;
        conn.query(sel, (err, results) => {
            console.log(results)
            if(results.length < 1){
                console.log('없는 회원')
                res.redirect('http://115.85.180.68:8000/main#section-login');
            } else{
                for(var i = 0; i < results.length; i++){
                    if(req.body.login_id == results[i].userid && req.body.login_pw == results[i].userpw){
                        console.log("확인")
                        req.session.logined = true;
                        req.session.user_id = req.body.login_id;
                        res.render('main', { session: req.session.user_id });
                    }
                }
            }
        });
    }

    if(req.body.leave_id){
        const sel = `SELECT * FROM User WHERE userid = '${req.body.leave_id}' AND userpw = '${req.body.leave_pw}';`;
        conn.query(sel, (err, results) => {
            console.log(results)
            if(results.length < 1){
                console.log('본인만 탈퇴 가능')
                res.redirect('http://115.85.180.68:8000/main#section-mypage');
            } else{
                const del = `DELETE FROM User WHERE pk = ${results[0].pk} AND userid = '${req.body.leave_id}' AND userpw = '${req.body.leave_pw}';`;
                for(var i = 0; i < results.length; i++){
                    if(req.body.leave_id == results[i].userid && req.body.leave_pw == results[i].userpw){
                        conn.query(del, (err, result) => {
                            console.log("탈퇴 완료")
                            req.session.destroy();
                            res.render('main', {session: "none"});
                        });
                    }
                }
            }
        });
    }

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('main');
    // res.render('main', {session: "none"});
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