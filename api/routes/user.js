const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");
const sendEmail = require("../utils/sendMail");
const messageWithActionTemplate = require("../emails/messageWithAction");
const plainMessageTemplate = require("../emails/plainMessage");
const verify = require("./verifyToken");

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

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email/password!");

  // if (user && !user.activated)
  //   return res
  //     .status(400)
  //     .send(
  //       "Sorry! Account not activated. Please complete email verification."
  //     );

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Incorrect email/password!");

  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      flat: user.flat,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "24h",
    }
  );
  res.header("auth-token", token).send({ "auth-token": token });
});

router.get("/verifyEmail", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Token not provided!");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const { userId, expiry } = decoded;
    if (new Date(expiry) > new Date()) {
      const user = await User.findOne({ _id: userId });
      if (!user.activated) {
        user.activated = true;
        try {
          user.save();
          const msg = {
            to: `${user.name} <${user.email}>`,
            from: `JS Console <no-reply@jsconsole.ml>`,
            subject: "Registration Successful 👍",
            html: messageWithActionTemplate(
              `Hi ${user.name},`,
              `Warm welcome to <b>JS Console</b>.<br/> Your email address is successfully verified. <br/> You can login now with your email and password.`,
              `https://jsconsole.ml/login`,
              "Login now!"
            ),
          };
          sendEmail(msg);
          res.send("Email address successfully verified!");
        } catch (err) {
          res.status(400).send(err);
        }
      } else {
        res.status(400).send("User already verified!");
      }
    } else {
      res.status(410).send("Link is expired!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/resetPassword", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send("Invalid Email!");
  }
  try {
    const user = await User.findOne({ email: email });

    const info = {};
    info.email = user.email;
    info.userId = user._id;
    info.expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    const token = jwt.sign(info, process.env.TOKEN_SECRET);
    const msg = {
      to: `${user.name} <${user.email}>`,
      from: `JS Console <no-reply@jsconsole.ml>`,
      subject: "Reset Your Password",
      html: messageWithActionTemplate(
        `Hi ${user.name},`,
        `Your recently tried to reset your password. Please use the link below to reset the same. <br/> <br/>And also, please note that the link will expire after <b>24 hrs</b> from now.`,
        `https://jsconsole.ml/update-password?token=${token}`,
        "Reset my password!"
      ),
    };
    sendEmail(msg);
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send("Invalid email!");
  }
});

router.post("/updatePassword", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).send("Token/password not provided!");
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const { userId, expiry } = decoded;
    if (new Date(expiry) > new Date()) {
      const user = await User.findOne({ _id: userId });
      user.password = hashPassword;
      try {
        user.save();
        const msg = {
          to: `${user.name} <${user.email}>`,
          from: `JS Console <no-reply@jsconsole.ml>`,
          subject: "Password Reset Successful 👍",
          text: "Your password has been successfully reset.",
          html: messageWithActionTemplate(
            `Hi ${user.name},`,
            `Your password has been successfully reset. Please use the link below to login.`,
            `https://jsconsole.ml/login`,
            "Login now!"
          ),
        };
        sendEmail(msg);
        res.send("Password successfully reset!");
      } catch (err) {
        res.status(400).send(err);
      }
    } else {
      res.status(410).send("Token is expired!");
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
      res.send(data);
    } else {
      res.status(400).send({ error: "Unknown error occurred in Github auth" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
