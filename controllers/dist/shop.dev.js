"use strict";

var Product = require('../models/product');

exports.getProducts = function (req, res, next) {
  Product.fetchAll(function (products) {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Shop',
      path: "/",
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  });
};

exports.NotFound = function (req, res, next) {
  res.status(404).render('404', {
    pageTitle: "Page Not Found"
  });
};