const express = require("express");
const cors = require("cors");
const Sentry = require("@sentry/node");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// import routes
const userRoute = require("./routes/user");
const projectRoute = require("./routes/project");

// config env variables
dotenv.config();

// Backend Port Number
const PORT_NUMBER = process.env.PORT || 5003;

Sentry.init({
  dsn: "https://f9c7dcb356244ff1a74fd08751f67bc5@o991007.ingest.sentry.io/5947904",
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

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
app.use(Sentry.Handlers.requestHandler());
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

app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      if ([400, 404, 414, 413, 500, 503].includes(error.statusCode)) {
        return true;
      }
      return false;
    },
  })
);

app.listen(PORT_NUMBER, () =>
  console.log("🌍  => JS Arena API server is on 🔥")
);
