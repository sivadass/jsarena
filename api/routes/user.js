const router = require("express").Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../model/User");
const verify = require("../middlewares/verifyToken");

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
        code: sessionCode,
      },
      {
        headers,
      }
    );
    console.log("====> ", tokenResponse?.data);
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
          const existingUser = await User.findOne({ gId: profileData.id });
          if (existingUser) {
            const token = jwt.sign(
              {
                _id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name,
              },
              process.env.TOKEN_SECRET,
              {
                expiresIn: "720h",
              }
            );
            res.send({ authToken: token });
          } else {
            const user = new User({
              name: profileData.name || profileData.login || profileData.id,
              email: profileData.email || "",
              gId: profileData.id,
              role: "user",
            });
            try {
              const savedUser = await user.save();
              const token = jwt.sign(
                {
                  _id: savedUser._id,
                  email: savedUser.email,
                  name: savedUser.name,
                },
                process.env.TOKEN_SECRET,
                {
                  expiresIn: "24h",
                }
              );
              res.send({ authToken: token });
            } catch (err) {
              res.status(400).send(err);
            }
          }
        } else {
          res
            .status(400)
            .send({ error: "Unknown error occurred in Github auth" });
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
