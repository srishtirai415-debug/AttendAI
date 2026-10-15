const express=require("express");
const path=require("path");
require("dotenv").config();
const mysql=require("mysql2");

const app=express();

app.use(express.static(path.join(__dirname,"../frontend")));



const db=mysql.createConnection({
    host : process.env.DB_HOST,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:Number(process.env.DB_PORT)
});

db.connect((err)=>{
    if(err){
        console.error("Database connection failed;",err.message);
        return;
    }
    console.log("MySQL connection successfully");
});

let PORT=process.env.PORT || 8080;
app.listen(PORT,()=>{
    console.log(`App listen at port ${PORT}`);
})