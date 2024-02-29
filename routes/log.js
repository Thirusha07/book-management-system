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

var router=express.Router();
const checkSession = (req, res, next) => {
    // Check if session exists
    if (req.session && req.session.user) {
        // Session exists, continue to the next middleware/route handler
        next();
    } else {
        // Session doesn't exist, or user is not logged in
        res.status(401).json({ message: "Unauthorized" });
    }
};
router.post('/writelog',checkSession,(req,res)=>{
    const currentDate = new Date();
    const formattedDateInput = currentDate.toLocaleDateString('en-GB'); 
    const parts = formattedDateInput.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    console.log(formattedDate)
    notes=JSON.stringify(req.body.notes)
    console.log(notes)

    const sql1='insert into readinglog (date1,userid,bookname,pageno,notes) values (?,?,?,?,?)';
    const values=[formattedDate,req.session.user[0].userid,req.body.bookname,req.body.pgno,notes]
    con.query(sql1,values,(err,result)=>{
        if(err){
            res.json({message:"Error while logging"})
        }
        else{
            res.json("Your log has been updated")
        }
      
    })
})
router.get('/viewalllogs',checkSession,(req,res)=>{
    const sql='select * from readinglog where userid=(?)'
    const values=req.session.user[0].userid
    con.query(sql,values,(err,result)=>{
        if(err){
            res.json({message:"Error while retrieving logs"})
        }
        else{
            const responseData = result.map(row => ({
                Date: row.date1,
                Bookname: row.bookname,
                Pageno: row.pageno,
                Notes: JSON.parse(row.notes)
            }));

            res.json(responseData);
        }
        
    })
})

router.post('/viewlog',checkSession,(req,res)=>{
    const currentDate = new Date();
    const formattedDateInput = currentDate.toLocaleDateString('en-GB'); 
    const parts = formattedDateInput.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const sql='select * from readinglog where userid=(?),date1=(?)'
    const values=[eq.session.user[0].userid,formattedDate]
    con.query(sql,values,(err,result)=>{
        if(err){
            res.json({message:"Error while retrieving log"})
        }
        else{
            res.json({result})
        }
       
    })
})
module.exports=router;
   