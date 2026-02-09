"use strict";

// const path = require('path');
var express = require('express'); // const rootDir = require('../util/path');


var productsController = require('../controllers/products');

var router = express.Router(); // /admin/add-product => GET

router.get('/add-product', productsController.getAddProduct); // /admin/add-product => POST

router.post('/add-product', productsController.postAddProduct); // exports.routes = router;
// exports.products = products;

module.exports = router;