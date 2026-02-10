"use strict";

var Product = require('../models/product');

exports.getAddProduct = function (req, res, next) {
  res.render('admin/add-product', {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    productCSS: true,
    formsCSS: true
  });
};

exports.postAddProduct = function (req, res, next) {
  var product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};