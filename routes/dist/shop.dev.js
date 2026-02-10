"use strict";

var express = require('express');

var shopController = require('../controllers/shop');

var router = express.Router();
router.get('/', shopController.getProducts);
router.get('/products');
router.get('/cart');
router.get('/checkout');
module.exports = router;