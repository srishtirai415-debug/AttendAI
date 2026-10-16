const express=require('express');
const {getAllSubjects,getOneSubject,createSubject, updateSubject, deleteSubject}=require("../controllers/subjectController");
const routes=express.Router();

// get all subjects data 
routes.get("/",getAllSubjects);

// get one subject data
routes.get("/:id",getOneSubject);

// create new subject
routes.post("/create",createSubject);

// update subject
routes.put("/:id/update",updateSubject);

// delete subject
routes.delete("/:id/delete",deleteSubject);

module.exports=routes;