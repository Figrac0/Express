"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var db = require("../util/databse");

var Cart = require("./cart");

module.exports =
/*#__PURE__*/
function () {
  function Product(id, title, imageUrl, description, price) {
    _classCallCheck(this, Product);

    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  _createClass(Product, [{
    key: "save",
    value: function save() {
      return db.execute("INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)", [this.title, this.price, this.imageUrl, this.description]);
    }
  }], [{
    key: "deleteById",
    value: function deleteById(id) {}
  }, {
    key: "fetchAll",
    value: function fetchAll() {
      return db.execute("SELECT * FROM products");
    }
  }, {
    key: "findById",
    value: function findById(id) {
      return db.execute("SELECT * FROM products WHERE products.id = ?", [id]);
    }
  }]);

  return Product;
}();