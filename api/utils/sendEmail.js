const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (emailMessage) =>
  sgMail
    .send(emailMessage)
    .then((res) => {
      console.log("Email sent", res);
    })
    .catch((error) => {
      console.error(error);
    });

module.exports = sendEmail;
