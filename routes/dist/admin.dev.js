"use strict";

var express = require('express');

var adminController = require('../controllers/admin');

var router = express.Router();
router.get('/add-product', adminController.getAddProduct);
router.get('/products');
router.post('/add-product', adminController.postAddProduct);
module.exports = router;