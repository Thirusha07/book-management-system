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

router.post('/insertbook',checkSession,(req,res)=>{
    const sql1='select genre from genres where genre=(?)';
    const values1=[req.body.genre];
    con.query(sql1,values1,(err,results)=>{
        if(results.length==0){
            const sql2='insert  into genres (genre)values(?)'
            const values2=[req.body.genre]
            con.query(sql2,values2,(err,result2)=>{
                if(err){
                    console.log("Error in inserting the genre",err);
                }
                res.json("Genre is inserted successfully");
                console.log("Genre inserted");
            })

        }
        const sql3='Insert into books (bookname,genre,author) values(?,?,?)';
        const values3=[req.body.bookname.toUpperCase(),req.body.genre,req.body.author];
        con.query(sql3,values3,(err,result)=>{
            if(err){
                console.log("Error in inserting a book",err)
            }
            console.log("book inserted")
            console.log(result)
            res.json("Book submitted")})

    })
    

})

router.post('/searchbook',checkSession,(req,res)=>{
        if(req.body.category=='genre'){
            const sql='select * from books where genre=(?)';
            const values=[req.body.genre];
            con.query(sql,values,(err,result)=>{
                if(err){
                    console.log("Error in searching on genre",err)
                }
                console.log(result)
                res.json({result})
            })
        }
        else
        {
            const sql='select * from books where author=(?)';
            const values=req.body.author;
            con.query(sql,values,(err,result)=>{
                if(err){
                    console.log("Error in searching on authors",err)
                }
                else
                {
                    console.log(result)
                    res.json({result})
                }
            })
        }


})

router.post('/addtoreadlist',checkSession,(req,res)=>{
    const sql1='select bookid from books where bookname=(?)'
    const value1=[req.body.bookname]
    con.query(sql1,value1,(err,result1)=>{
        console.log(result1[0].bookid)
        const sql2='insert into reading_list (userid,bookid) values(?,?)'
        const value2=[req.session.user[0].userid,result1[0].bookid]
        con.query(sql2,value2,(err,result2)=>{
            if(err){
                console.log("Error while adding book to the readinglist",err)
            }
            res.json("Book added to your readinglist")
        })
    })

})

router.get('/viewreadlist',checkSession,(req,res)=>{
    const sql1='select bookid from reading_list where userid=(?)'
    const value1=[req.session.user[0].userid]
    con.query(sql1,value1,(err,result1)=>{
        if(err){
            console.log("Error while retrieving bookids of readinglist",err)
        }
        console.log(result1)
        const books=result1.map(row=>row.bookid)
        const sql2='select bookname,genre,author,ratings from books where bookid in(?)'
        const value2=[books]
        con.query(sql2,value2,(err,result2)=>{
            if(err){
                console.log("Error while retrieving book information",err)
            }
            console.log(result2)
            res.json(result2)
        })
    })

    })
router.post('/giveratings',checkSession,(req,res)=>{
    

    const sql1='select bookid from books where bookname=(?)'
    const value1=[req.body.bookname]
    con.query(sql1,value1,(err,result1)=>{
        if(err){
            console.log("Error in retrieving bookid")
        }
        console.log(result1[0].bookid)
        const sql='update reading_list set ratings=? where bookid=?,userid=?'
        const values=[req.body.ratings,result1[0].bookid,req.session.user[0].userid]
        con.query(sql,values,(err,result)=>{
            if(err){
                console.log("error")
            }
            res.json({message:"your rating added to readinglist"})
        })
        const sql2='select no_of_ratings,avg_ratings from books where bookid=(?)'
        const value2=[result1[0].bookid]
        con.query(sql2,value2,(err,result2)=>{
                if(err){
                    console.log("Error in retrieving previous ratings")
                }
                console.log("No of ratings",result2[0].no_of_ratings)
                console.log("Avg ratings",result2[0].avg_ratings)
                no_ratings=result2[0].no_of_ratings + 1
                avg= result2[0].avg_ratings +req.body.ratings
                rating=avg/no_ratings
                console.log(no_ratings)
                console.log(avg)
                console.log(rating)
                const sql3='update books set no_of_ratings=?,avg_ratings=?,ratings=? where bookid=?'
                const value3=[no_ratings,avg,rating,result1[0].bookid]
                con.query(sql3,value3,(err,result3)=>{
                    res.json("Ratings are updated")
                })

        })
    })


   
})
router.post('/addtofavourites',checkSession,(req,res)=>{
    const sql1='select bookid from books where bookname=(?)'
    const values1=[req.body.bookname]
    con.query(sql1,values1,(err,result1)=>{
        if(err){
            console.log("Error while retrieving bookid",err)
            res.json({message:"Error while retrieving bookid"})
        }
        const sql2='insert into favourites (userid,bookid) values(?,?)';
        const values2=[req.session.user[0].userid,result1[0].bookid]
        con.query(sql2,values2,(err,result2)=>{
            if(err){
                console.log("Error while adding to favourites",err)
                res.json({message:"Error while adding to favourites"})
            }
            else{
                res.json({message:"Book added to favourites"})
            }
        })
        
    })

})
router.delete('/removefromfavourites',checkSession,(req,res)=>{
    const sql1='select bookid from books where bookname=(?)'
    const values1=[req.body.bookname]
    con.query(sql1,values1,(err,result1)=>{
        if(err){
            console.log("Error while fetching bookid",err)
            res.json({message:"Error while fetching bookid"})
        }
        else{
            const sql2='delete from favourites where bookid=(?) and userid=(?)'
            const values2=[result1[0].bookid,req.session.user[0].userid]
            con.query(sql2,values2,(err,result2)=>{
                if(err){
                    console.log("Error in removing from favourites",err)
                    res.json({message:"Error in removing from favourites"})
                }
                res.json({message:"Removed from favourites"})
            })
        }
    })
})
module.exports=router;