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
router.post('/createclub',checkSession,(req,res)=>{
    console.log("type",typeof(req.session.user))
    console.log(req.session.user[0].user);
    const sql='insert into clubs (clubname,clubadmin,clubgenre) values(?,?,?)';
    const values=[req.body.clubname,req.session.user[0].user,req.body.genre];
    con.query(sql,values,(err,result)=>{
        if(err){
            res.json({message:"Error in creating club"})
        }
        res.json("club created ")
    })
    
    
})

router.post('/joinclub',checkSession,(req,res)=>{
    const sql ='select clubid from clubs where clubname=(?)';
    const values=[req.body.clubname];
    let c_name;
    con.query(sql,values,(err,result)=>{
        if(err){
            console.log("error while retrieving clubid",err)
            res.json({message:"error while retrieving clubid"})
        }
        console.log(result)
        c_name=result[0].clubid;
        console.log(c_name)
        if(result.length==0){
            res.json("There is no such clubname")
        }
        const sql1='insert into clubmembers (clubid,userid) values (?,?)';
        const values1=[c_name,req.session.user[0].userid]
        con.query(sql1,values1,(err,result1)=>{
            if(err){
                console.log("Error while inserting clubmember",err)
                res.json({message:"Error while inserting clubmember"})
            }
            console.log(result1)
            res.json("Clubmember added")
    
        })
    

    })
 
})

router.post('/searchclub',checkSession,(req,res)=>{
    if(req.body.category=='genre'){
        const sql ='select clubname,clubadmin,clubgenre from clubs where clubgenre=(?)';
        const values=[req.body.genre]
        con.query(sql,values,(err,results)=>{
            if(err){
                console.log("Error in retreiving clubs",err)
                res.json({message:"Error in retreiving clubs"})
            }
            res.json({results})

        })

    }
    else{
        const sql1='select clubname,clubadmin,clubgenre from clubs where clubname=(?)'
        const values1=[req.body.clubname];
        con.query(sql1,values1,(err,result)=>{
            if(err){
                console.log("Error in retrieving clubs")
                res.json({message:"Error in retrieving clubs"})
            }
            res.json({result})
        })
    }

})
router.post('/viewclubmembers',checkSession,(req,res)=>{
    const sql='select clubid from clubs where clubname=(?)'
    const values=[req.body.clubname]
    con.query(sql,values,(err,result)=>{
        if(err){
            console.log("Error while retrieving clubid",err)
            res.json({message:"Error while retrieving clubid"})
        }
        const sql1='select userid from clubmembers where clubid=(?)';
        const value1=[result[0].clubid]
        console.log("clubid",value1)
        con.query(sql1,value1,(err,results)=>{
            if(err){
                console.log("Error while retrieving userid")
                res.json({message:"Error while retrieving userid"})
            }
            console.log(results)
            console.log(results.length)
            console.log(results[0])
            console.log("id",results[0].userid)
            const userids=results.map(row=>row.userid)
            const sql2='select user from users where userid in(?)'
            const values2=[userids]
            con.query(sql2,values2,(err,result2)=>
            {
                if(err){
                    console.log("Error while retrieving usernames")
                    res.json({message:"Error while retrieving usernames"})
                }
                console.log(result2)
                const users= result2.map(row=>row.user)
                res.json(users)
            })
        })
    })
})

router.post('/groupchat',checkSession,(req,res)=>{
    const sql1='select clubid from clubs where clubname=(?)'
    const values1=[req.body.clubname]
    con.query(sql1,values1,(err,result1)=>{
        if(err){
            console.log("Error while retrieving clubid",err)
            res.json({message:"Error while retrieving clubid"})
        }
        const currentDate = new Date();
        const formattedDateInput = currentDate.toLocaleDateString('en-GB'); 
        const parts = formattedDateInput.split('/');
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        console.log(formattedDate)
        const sql2='insert into Groupchat (userid,clubid,date1,msgs) values(?,?,?,?)'
        const values2=[req.session.user[0].userid,result1[0].clubid,formattedDate,req.body.msgs]
        con.query(sql2,values2,(err,result2)=>{
            if(err){
                console.log("Error while inserting message",err)
                res.json({message:"Error while inserting message"})
            }
            res.json({message:"Message inserted successfully"})

        })
    })


})


module.exports=router;