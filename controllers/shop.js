const  Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {prods:products, pageTitle:'Shop', path: "/", hasProducts: products.length>0, activeShop: true, productCSS: true});
  });
  
}

exports.NotFound = (req, res, next) => {
    res.status(404).render('404',{ pageTitle:"Page Not Found"});
}