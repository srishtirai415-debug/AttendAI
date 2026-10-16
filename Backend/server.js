const express=require("express");
const path=require("path");
require("dotenv").config();
const subjectRoute=require("./routes/subjectRoute");
const dashboardRoute=require("./routes/dashboardRoute")
const db=require("./config/dbConnection");

const app=express();
let PORT=process.env.PORT || 8080;
app.use(express.json());

// load all static files
app.use(express.static(path.join(__dirname,"../frontend")));

// connecting to database
db.connect((err)=>{
    if(err){
        console.error("Database connection failed;",err.message);
        return;
    }
    console.log("MySQL connection successfully");
});
// subject routes
app.use("/api/subject",subjectRoute);

// dashboard routes
app.use("/api/dashboard",dashboardRoute);

app.listen(PORT,()=>{
    console.log(`App listen at port ${PORT}`);
})