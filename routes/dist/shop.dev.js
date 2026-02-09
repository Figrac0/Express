"use strict";

// const path = require('path');
var express = require('express'); // const rootDir = require('../util/path');
// const adminData = require('./admin');


var productsController = require('../controllers/products');

var router = express.Router();
router.get('/', productsController.getProducts);
module.exports = router;