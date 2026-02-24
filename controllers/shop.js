const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render("shop/product-list", {
                prods: products,
                pageTitle: "Products",
                path: "/products",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render("shop/product-detail", {
                product: product,
                pageTitle: product.title,
                path: "/products",
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render("shop/index", {
                prods: products,
                pageTitle: "Shop",
                path: "/",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            res.render("shop/cart", {
                path: "/cart",
                pageTitle: "Your Cart",
                products: user.cart.items,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then((result) => {
            res.redirect("/cart");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;

    req.user
        .populate("cart.items.productId")
        .then((user) => {
            products = user.cart.items;

            total = products.reduce(
                (acc, p) => acc + p.quantity * p.productId.price,
                0,
            );

            return stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: products.map((p) => ({
                    quantity: p.quantity,
                    price_data: {
                        currency: "usd",
                        unit_amount: Math.round(
                            Number(p.productId.price) * 100,
                        ),
                        product_data: {
                            name: p.productId.title,
                            description: p.productId.description,
                        },
                    },
                })),
                success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
                cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
            });
        })
        .then((session) => {
            res.render("shop/checkout", {
                path: "/checkout",
                pageTitle: "Checkout",
                products,
                totalSum: total,
                sessionId: session.id,
                stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
            });
        })
        .catch((err) => next(err));
};

exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return {
                    quantity: i.quantity,
                    product: { ...i.productId._doc },
                };
            });

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user._id,
                },
                products: products,
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return {
                    quantity: i.quantity,
                    product: { ...i.productId._doc },
                };
            });

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user._id,
                },
                products: products,
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getOrders = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/login");
    }

    Order.find({ "user.userId": req.user._id })
        .then((orders) => {
            res.render("shop/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
                orders,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .then((order) => {
            if (!order) {
                return next(new Error("No order found!"));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error("Unauthorized!"));
            }
            const invoiceName = "invoice-" + orderId + ".pdf";
            const invoicePath = path.join("data", "invoices", invoiceName);

            const pdfDoc = new PDFDocument();

            res.setHeader(
                "Content-Disposition",
                "inline; filename ='" + invoiceName + "'",
            );

            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            const formatMoney = (n) => `$${Number(n).toFixed(2)}`;
            const formatDate = (d) =>
                new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                }).format(d);

            const PAGE_MARGIN = 50;
            const PAGE_WIDTH = 595.28; // A4 points
            const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

            const COL = {
                item: PAGE_MARGIN,
                qty: PAGE_MARGIN + CONTENT_WIDTH * 0.62,
                price: PAGE_MARGIN + CONTENT_WIDTH * 0.74,
                sum: PAGE_MARGIN + CONTENT_WIDTH * 0.86,
            };

            const drawHr = (y) => {
                pdfDoc
                    .moveTo(PAGE_MARGIN, y)
                    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, y)
                    .strokeColor("#d0d0d0")
                    .lineWidth(1)
                    .stroke();
            };

            const ensureSpace = (need = 40) => {
                if (pdfDoc.y + need >= pdfDoc.page.height - PAGE_MARGIN) {
                    pdfDoc.addPage();
                }
            };

            // ---- HEADER (brand block) ----
            pdfDoc
                .fillColor("#111111")
                .font("Helvetica-Bold")
                .fontSize(28)
                .text("INVOICE", PAGE_MARGIN, 45);

            pdfDoc
                .font("Helvetica")
                .fontSize(10)
                .fillColor("#555555")
                .text(`Invoice ID: ${order._id}`, PAGE_MARGIN, 82)
                .text(`Date: ${formatDate(new Date())}`, PAGE_MARGIN, 97)
                .text(`Customer: ${order.user.email}`, PAGE_MARGIN, 112);

            pdfDoc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#111111")
                .text("Express Shop", PAGE_MARGIN + CONTENT_WIDTH - 160, 82, {
                    width: 160,
                    align: "right",
                });

            pdfDoc
                .font("Helvetica")
                .fontSize(10)
                .fillColor("#555555")
                .text(
                    "sales@express-shop.local",
                    PAGE_MARGIN + CONTENT_WIDTH - 160,
                    97,
                    { width: 160, align: "right" },
                )
                .text(
                    "Thank you for your purchase",
                    PAGE_MARGIN + CONTENT_WIDTH - 160,
                    112,
                    { width: 160, align: "right" },
                );

            drawHr(140);
            pdfDoc.moveDown(2);

            // ---- TABLE HEADER ----
            pdfDoc.font("Helvetica-Bold").fontSize(11).fillColor("#111111");

            const headerY = pdfDoc.y;
            pdfDoc.text("Item", COL.item, headerY, {
                width: COL.qty - COL.item - 10,
            });
            pdfDoc.text("Qty", COL.qty, headerY, {
                width: COL.price - COL.qty - 10,
                align: "right",
            });
            pdfDoc.text("Price", COL.price, headerY, {
                width: COL.sum - COL.price - 10,
                align: "right",
            });
            pdfDoc.text("Sum", COL.sum, headerY, {
                width: PAGE_MARGIN + CONTENT_WIDTH - COL.sum,
                align: "right",
            });

            pdfDoc.moveDown(0.8);
            drawHr(pdfDoc.y);
            pdfDoc.moveDown(0.6);

            // ---- TABLE ROWS ----
            pdfDoc.font("Helvetica").fontSize(11).fillColor("#111111");

            let total = 0;

            order.products.forEach((prod, idx) => {
                const title = String(prod.product.title ?? "");
                const qty = Number(prod.quantity ?? 0);
                const price = Number(prod.product.price ?? 0);
                const sum = qty * price;
                total += sum;

                ensureSpace(55);

                const rowY = pdfDoc.y;

                // zebra light separator every row
                if (idx > 0) {
                    pdfDoc.moveDown(0.2);
                }

                pdfDoc.text(title, COL.item, rowY, {
                    width: COL.qty - COL.item - 10,
                });
                pdfDoc.text(String(qty), COL.qty, rowY, {
                    width: COL.price - COL.qty - 10,
                    align: "right",
                });
                pdfDoc.text(formatMoney(price), COL.price, rowY, {
                    width: COL.sum - COL.price - 10,
                    align: "right",
                });
                pdfDoc.text(formatMoney(sum), COL.sum, rowY, {
                    width: PAGE_MARGIN + CONTENT_WIDTH - COL.sum,
                    align: "right",
                });

                // move down based on wrapped lines of title
                pdfDoc.moveDown(1.1);
                drawHr(pdfDoc.y);
                pdfDoc.moveDown(0.6);
            });

            // ---- TOTAL BLOCK ----
            ensureSpace(110);

            pdfDoc.moveDown(1);
            pdfDoc
                .font("Helvetica-Bold")
                .fontSize(14)
                .fillColor("#111111")
                .text("Total", PAGE_MARGIN + CONTENT_WIDTH - 200, pdfDoc.y, {
                    width: 90,
                    align: "right",
                });

            pdfDoc
                .font("Helvetica-Bold")
                .fontSize(16)
                .fillColor("#111111")
                .text(
                    formatMoney(total),
                    PAGE_MARGIN + CONTENT_WIDTH - 100,
                    pdfDoc.y - 2,
                    { width: 100, align: "right" },
                );

            pdfDoc.moveDown(2);
            drawHr(pdfDoc.y);
            pdfDoc.moveDown(1.5);

            // ---- FOOTER ----
            pdfDoc
                .font("Helvetica")
                .fontSize(9)
                .fillColor("#666666")
                .text(
                    "If you have questions about this invoice, reply to this email: sales@express-shop.local",
                    PAGE_MARGIN,
                    pdfDoc.y,
                    { width: CONTENT_WIDTH, align: "center" },
                );

            pdfDoc.end();
        })
        .catch((err) => next(err));
};
