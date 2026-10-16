const express=require("express");
const routes=express.Router();
const {dashboardSummary}=require("../controllers/dashboardController");

routes.get("/",dashboardSummary);

module.exports=routes;