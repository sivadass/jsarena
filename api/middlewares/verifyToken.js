const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const token = req.header("Auth-Token");
  if (!token) return res.status(401).send("Access denied!");
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log("err in middleware", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Unauthorized!");
    }
    return res.status(401).send(err);
  }
};
