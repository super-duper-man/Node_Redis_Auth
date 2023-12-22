const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const {createClient} = require('redis')
const RedisStore = require('connect-redis').default
const redisClient = createClient({legacyMode: true})
require("dotenv").config();

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");

redisClient.connect().catch(error => console.log(`Could not connect to redis`, error))

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
  }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 10
    }
  })
);

app.use("/", indexRouter);
app.use("/users", authRouter);

module.exports = app;
