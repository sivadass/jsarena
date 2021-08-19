const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// import routes
const userRoute = require("./routes/user");
const projectRoute = require("./routes/project");

// Backend Port Number
const PORT_NUMBER = process.env.PORT || 5003;

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
  .then(() => console.log("🌍  => Connected to Mongo DB 🔥"))
  .catch((err) => console.log(err));

// Express Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Route Middlewares
app.use("/v1/user", userRoute);
app.use("/v1/project", projectRoute);

app.get("/", function (_, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(PORT_NUMBER, () =>
  console.log("🌍  => JS Arena API server is on 🔥")
);
