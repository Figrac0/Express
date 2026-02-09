"use strict";

var path = require('path');

var express = require('express');

var bodyParser = require('body-parser'); // const expressHBs = require('express-handlebars')


var errorController = require('./controllers/error');

var app = express(); // app.set('view engine', 'pug');
// app.engine('hbs', expressHBs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout', extname: 'hbs'}));
// app.set('view engine', 'hbs');

app.set('view engine', 'ejs');
app.set('views', 'views');

var adminRoutes = require('./routes/admin');

var shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express["static"](path.join(__dirname, 'public')));
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404Page);
app.listen(3000);