const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function sendEmail(msg) {
  try {
    await sgMail.send(msg);
  } catch (err) {
    console.log("👹 ===>", err);
  }
};
