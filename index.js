const express = require('express');
const nunjucks = require('nunjucks')
const axios = require('axios')
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
    express : app,
});

const kakao = {
    clientID: '7ea1cfa69204ed386f24a86470709ed7',
    clientSecret: 'Qs31dHogw6T11R2IDF3wMYDU0Pn5Ht7S',
    redirectUri: 'http://localhost:3000/auth/kakao/callback'
}

app.get('/',(req,res)=>{
    res.render('index')
});

app.get('/auth/kakao',(req,res)=>{
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`

    res.redirect(kakaoAuthURL);
})

app.get('/auth/kakao/callback',async(req,res)=>{
    let token;
    try{
        token = await axios({
            method:'POST',
            url:'https://kauth.kakao.com/oauth/token',
            headers:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:qs.stringify({
                grant_type:'authorization_code',
                client_id:kakao.clientID,
                client_secret:kakao.redirectUri,
                code:req.query.code,screenLeft
            })
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
                Authorization:`bearer ${token.data.access_token}`
            }
        })
    } catch(err){
        res.json(err.data)
    }
    console.log(user);

    req.session.kakao = user.data;


    res.redirect('/');
})

app.get('/auth/info',(req,res)=>{
    let {nickname,profile_image} = req.session.kakao.properties
    res.render('info',{
        nickname,profile_image
    })
})


app.listen(3000,()=>{
    console.log(`start server port 3000`)
});