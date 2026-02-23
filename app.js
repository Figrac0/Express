// app.js

require("dotenv").config();

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        // Windows-safe filename (no :)
        const safeDate = new Date()
            .toISOString()
            .replace(/:/g, "-")
            .replace(/\./g, "-");
        cb(null, `${safeDate}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
);

// static
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// session
app.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    }),
);

// csrf + flash (после session)
app.use(csrfProtection);
app.use(flash());

// locals for views
app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// attach user to req by userId
app.use((req, res, next) => {
    if (!req.session.userId) return next();

    User.findById(req.session.userId)
        .then((user) => {
            if (!user) return next();
            req.user = user;
            next();
        })
        .catch((err) => next(new Error(err)));
});

// routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

// global error handler (последним)
app.use((error, req, res, next) => {
    res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: !!req.session.isLoggedIn,
    });
});

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
