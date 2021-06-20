const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");
const sendEmail = require("../utils/sendMail");
const messageWithActionTemplate = require("../emails/messageWithAction");
const plainMessageTemplate = require("../emails/plainMessage");
const verify = require("../middlewares/verifyToken");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    role: req.body.role,
  });

  try {
    const savedUser = await user.save();
    const msg = {
      to: `${savedUser.name} <${savedUser.email}>`,
      from: `JS Console <no-reply@jsconsole.ml>`,
      subject: `Welcome to JS Console`,
      html: plainMessageTemplate(
        `Hi ${savedUser.name},`,
        `Thanks for signing up with JS Console. We wish you a happing JS Programming Journey! <br/><br/> Please use the link below to access it: <br /> <a href="https://jsconsole.ml">https://jsconsole.ml</a>`
      ),
    };
    try {
      await sendEmail(msg);
      res.send("Registered successfully!");
    } catch (err) {
      res.status(400).send(err);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/profile", verify, async (req, res) => {
  try {
    User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        flat: req.body.flat,
      },
      { upsert: true, new: true },
      (err, data) => {
        if (err) {
          return res.send(err);
        }
        return res.send(data);
      }
    );
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/github-authorize", async (req, res) => {
  const { sessionCode } = req.body;
  const headers = {
    Accept: "application/json",
  };
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
        code: sessionCode,
      },
      {
        headers,
      }
    );
    const data = tokenResponse.data;
    if (data.error === "bad_verification_code") {
      res.status(400).send(data);
    } else if (data.access_token) {
      const profileHeaders = {
        Authorization: `token ${data.access_token}`,
      };
      try {
        const profileResponse = await axios.get("https://api.github.com/user", {
          headers: profileHeaders,
        });
        const profileData = profileResponse && profileResponse.data;
        if (profileData) {
          console.log(profileData);
          res.send(profileData);
        } else {
          console.log(profileResponse);
        }
      } catch (err) {
        res.status(400).send(err);
      }
    } else {
      res.status(400).send({ error: "Unknown error occurred in Github auth" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
