"use strict";

var Product = require('../models/product'); // const products = [];


exports.getAddProduct = function (req, res, next) {
  res.render('add-product', {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    productCSS: true,
    formsCSS: true
  });
};

exports.postAddProduct = function (req, res, next) {
  //   products.push({ title: req.body.title });
  var product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};

exports.getProducts = function (req, res, next) {
  //   const products = adminData.products;
  Product.fetchAll(function (products) {
    res.render('shop', {
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