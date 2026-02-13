"use strict";

require("dotenv").config();

var path = require("path");

var express = require("express");

var bodyParser = require("body-parser");

var errorController = require("./controllers/error");

var db = require("./util/databse");

var app = express();
app.set("view engine", "ejs");
app.set("views", "views");

var adminRoutes = require("./routes/admin");

var shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express["static"](path.join(__dirname, "public")));
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);
app.listen(3000);