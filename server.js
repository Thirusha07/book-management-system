const express=require('express')
const bodyparser=require('body-parser')
const bcrypt = require("bcrypt")
var session =require("express-session")
var cookieparser=require("cookie-parser")
var cors=require('cors')
var mysql=require('mysql')
port=8000
const app=express()
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
const saltRounds=10
app.use(session({
    key: "user",
    secret: "sample",
    resave: false,
    saveUninitialized: true,
    cookie: { expires: false }
  }))
app.use(cookieparser())

app.use(
    cors({
      origin: '*',
      methods: ["GET", "POST"],
      credentials: true
    })
  );


var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Samaya#9421",
    database:"users01"

})
con.connect();


var user=require('./routes/user.js')
app.use('/user',user)
var books=require('./routes/books.js')
app.use('/books',books)
var club=require('./routes/club.js')
app.use('/club',club)
var log=require('./routes/log.js')
app.use('/log',log)





app.listen(port,()=>{
    console.log(`Server running at ${port}`)
})