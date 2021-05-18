const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// import routes
const authRoute = require("./routes/auth");
const collectionRoute = require("./routes/collection");
const paymentRoute = require("./routes/payment");
const expenseRoute = require("./routes/expense");
const categoryRoute = require("./routes/category");
const flatRoute = require("./routes/flat");

// Backend Port Number
const PORT_NUMBER = process.env.PORT || 5001;

// config env variables
dotenv.config();

// connect to db
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("🌍  : Connected to Mongo DB 🔥"))
  .catch((err) => console.log(err));

// Express Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Route Middlewares
app.use("/api/v1/user", authRoute);
app.use("/api/v1/collection", collectionRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/expense", expenseRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/flat", flatRoute);

app.get("/", function (_, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(PORT_NUMBER, () =>
  console.log("🌍  : JS Console API server is on 🔥")
);
