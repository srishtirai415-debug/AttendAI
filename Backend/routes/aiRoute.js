const express = require("express");
const { getInsights, calculateAttendance, projectAttendance } = require("../controllers/aiController");

const routes = express.Router();

routes.post("/insights", getInsights);
routes.post("/calculator", calculateAttendance);
routes.post("/what-if", projectAttendance);

module.exports = routes;
