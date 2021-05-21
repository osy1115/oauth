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
    res.render('index');
});

app.get('/auth/kakao',(req,res)=>{
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`

    res.redirect(kakaoAuthURL);
})

app.get('/auth/kakao/callback',async(req,res)=>{
    // axios Promise Object
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
                code:req.query.code,
            }) // 객체를 string으로 변환
        })
    } catch(err){
        res.json(err.data)
    }

    console.log(token);

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
    console.log(user);

    req.session.kakao = user.data;
    

    res.redirect('/');
});

app.get('/auth/info',(req,res)=>{
    let {nickname,profile_image} = req.session.kakao.properties
    res.render('info',{
        nickname,profile_image
    })
})

app.listen(3000,()=>{
    console.log(`server start port 3000`);
});