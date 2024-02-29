const express=require('express')
const bodyparser=require('body-parser')
const bcrypt = require("bcrypt")
var session =require("express-session")
var cors=require('cors')
var cookieparser=require("cookie-parser")
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

var router=express.Router();

router.post('/signup',(req,res)=>{
    bcrypt.hash(req.body.pass, saltRounds, function(err, hash) {
        const sql='Insert into users (user,password) values (?,?)';
        const values=[req.body.user,hash];
        console.log(values)
        con.query(sql,values,(err,results)=>{
            if(err){
                console.error("Error in executing the insert query:",err);
                return
            }
            console.log("user is created",results)

            res.json("user successfully created")
        })
    
      });
  
 


})

router.post('/signin',(req,res)=>{
const sql='select * from users where user=(?)'
const values=[req.body.user]
con.query(sql,values,(err,results)=>{
    console.log(results)
    if(results.length==0){
        res.json("Invalid user")
    }
    else{
        console.log(results[0].password)
        bcrypt.compare(req.body.pass,results[0].password,(err,result)=>{
            console.log(result)
            if(result==true){
                    req.session.user=results
                    res.json("login succesful")
                    console.log(req.session)
            }
            else{
                res.json("Invalid password")
            }
        })
    }
       
})
})
module.exports = router;
