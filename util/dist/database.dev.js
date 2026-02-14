"use strict";

// const mysql = require("mysql2");
// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
// });
// module.exports = pool.promise();
var Sequelize = require("sequelize");

require("dotenv").config();

var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: "mysql",
  host: process.env.DB_HOST
});
module.exports = sequelize;