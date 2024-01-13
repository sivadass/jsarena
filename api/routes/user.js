const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../model/User");
const verify = require("../middlewares/verifyToken");
const { loginValidation, registerValidation } = require("../utils/validation");
const sendEmail = require("../utils/sendEmail");
const plainMessageTemplate = require("../email-templates/plain-message");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    res.status(400).send({
      message: error.details[0].message,
    });
    return;
  }

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    res.status(400).send({
      message: "Email already exists",
    });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
  });

  try {
    const savedUser = await user.save();
    const info = {};
    info.userId = savedUser._id;
    info.expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const token = jwt.sign(info, process.env.TOKEN_SECRET);
    const msg = {
      to: `${user.name} <${user.email}>`,
      from: `JSArena <admin@jsarena.dev>`,
      subject: "Welcome to JSArena",
      html: plainMessageTemplate(
        `Hi ${user.name},`,
        `Thank you for signing up with <b>JSArena</b>. <br/>Please verify your email address by clicking the link below to complete the registration.`,
        `https://jsarena.dev/verify?token=${token}`
      ),
    };
    try {
      await sendEmail(msg);
      res.send({
        message: "Verification email sent, please check your inbox to login.",
      });
    } catch (err) {
      res.status(400).send({
        message: err,
      });
    }
  } catch (err) {
    res.status(400).send({
      message: err,
    });
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);

  if (error) {
    res.status(400).send({
      message: error.details[0].message,
    });
    return;
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(400).send({
      message: "Invalid email/password!",
    });
    return;
  }

  // if (user && !user.activated)
  //   return res
  //     .status(400)
  //     .send(
  //       "Sorry! Account not activated. Please complete email verification."
  //     );

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    res.status(400).send({
      message: "Invalid email/password!",
    });
    return;
  }

  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "24h",
    }
  );
  res.send({ "auth-token": token });
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

module.exports = router;
