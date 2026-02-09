"use strict";

// const path = require('path');
var express = require('express'); // const rootDir = require('../util/path');


var adminData = require('./admin');

var router = express.Router();
router.get('/', function (req, res, next) {
  var products = adminData.products;
  res.render('shop', {
    prods: products,
    pageTitle: 'Shop',
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true
  });
});
module.exports = router;