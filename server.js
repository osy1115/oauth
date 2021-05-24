/* Autherication 인증 Authoization 허가 */
/*
    REST API KEY : 7ea1cfa69204ed386f24a86470709ed7
    REDIRECT URI : http://localhost:8000/auth/kakao/callback
    SECRET KEY : Qs31dHogw6T11R2IDF3wMYDU0Pn5Ht7S
*/
const express = require('express');
const nunjucks = require('nunjucks');
const axios = require('axios');
const qs = require('qs');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(session({
    secret:'asd',
    resave:false,
    secure:false,
    saveUninitialized:false,
}))

app.set('view engine','html');
nunjucks.configure('views',{
    express:app,
});

const kakao = {
    clientID: '7ea1cfa69204ed386f24a86470709ed7',
    clientSecret: 'Qs31dHogw6T11R2IDF3wMYDU0Pn5Ht7S',
    redirectUri: 'http://localhost:3000/auth/kakao/callback'
}


app.get('/',(req,res)=>{
    const {msg} = req.query;
    //console.log(req.session.authData);
    res.render('index',{
        msg,
        logininfo:req.session.authData,
    });
});

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login2',(req,res)=>{
    console.log(req.headers);
    //res.setHeader('content-type','application/x-www-form-urlencoded')
    //res.send('ok');
    console.log(req.get('user-agent'));
    //req.set('content-type','application/x-www-form-urlencoded');

    //header 영역에서 status 값이 200대면 성공// 300~400 에러
   res.set('token','dass')
   res.set('Authorization',`Bearer en`)
   res.json({text:'ok'});
});

app.post('/login',(req,res)=>{
    //console.log(req.body);
    const {session,body} = req;
    const {userid,userpw} = req.body;

    if(userid == 'root' && userpw == 'root'){
        const data = {
            userid,
        }

        session.authData = {
            ["local"]:data,
        }
        res.redirect('/?msg=로그인이 완료되었습니다.')
    } else{
        res.redirect('/?msg=아이디와 패스워드를 확인해주세요.')
    }
})

app.get('/auth/kakao',(req,res)=>{
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`

    res.redirect(kakaoAuthURL);
})

app.get('/auth/kakao/callback',async(req,res)=>{
    // axios Promise Object
    const {session,query} = req;
    const {code} = query; // req.query.code -> code
    
    let token;
    try{
        token = await axios({
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'content-type':'application/x-www-form-urlencoded'
            }, // npm install qs
            data:qs.stringify({
                grant_type:'authorization_code', // 특정 스트링
                client_id:kakao.clientID,
                client_secret:kakao.clientSecret,
                redirectUri:kakao.redirectUri,
                //code:req.query.code, 속성값과 변수명이 같기 때문에 code 하나로 사용가능
                code,
            }) // 객체를 string으로 변환
        })
    } catch(err){
        res.json(err.data)
    }

    //console.log(token);

    let user;
    try{
        user = await axios({
            method:'GET',
            url:'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: `bearer ${token.data.access_token}` 
            }
        })
    } catch (err) {
        res.json(err.data)
    }
    //console.log(user);

    //req.session.kakao = user.data;
    
    const authData = {
        ...token.data, // 깊은복사
        ...user.data, // 깊은복사
    }

    session.authData = {
        ['kakao']:authData,
    }

    //console.log(session);

    res.redirect('/');
});

const authMW = (req,res,next) =>{
    const {session} = req;
    if(session.authData == undefined){
        //console.log('로그인이 되어있지않음.')
        res.redirect('/?msg=로그인 안되어있음.')
    } else {
        //console.log('로그인 되어있음.');
        next();
    } 
}


app.get('/auth/info',authMW,(req,res)=>{
    const {authData} = req.session;
    const proVider = Object.keys(authData)[0];

    let userinfo = {}
    switch(proVider){
        case "kakao":
            userinfo = {
                userid:authData[proVider].properties.nickname,
            }
        break;
        case "local":
            userinfo = {
                userid:authData[proVider].userid,
            }
    }
    res.render('info',{
        userinfo,
    })
})

app.get('/auth/kakao/unlink', async (req,res)=>{
    const {session} = req;
    const {access_token} = session.authData.kakao

    //console.log(access_token);
    let unlink;
    try{
        unlink = await axios({
            method:'POST',
            url:'https://kapi.kakao.com/v1/user/unlink',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
    } catch (error){
        res.json(error.data);
    }
    //console.log(unlink.data); // id값이 떨어진이유는 카카오측에서 내 아이디를 이미 로그아웃 or 탈퇴 완료 되어서.
    // 세션을 지워야함.
    const {id} = unlink.data;

    if(session.authData["kakao"].id == id){
        delete session.authData;
    }

    res.redirect('/?msg=로그아웃 되었습니다.')
})

app.get('/auth/logout',(req,res)=>{
    const {session} = req
    const {authData} = req.session;
    const proVider = Object.keys(authData)[0];
    switch(proVider){
        case "local":
            delete session.authData;
            res.redirect('/?msg=로그아웃 되었습니다')
        break;
        case "kakao":
            res.redirect('/auth/kakao/unlink')
        break;
    }
})

app.listen(3000,()=>{
    //console.log(`server start port 3000`);
});