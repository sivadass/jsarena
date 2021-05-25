import { postData } from "./utils/fetch";
const loginButton = document.querySelector("button.login-submit");

loginButton.addEventListener("click", login);

function login(e) {
  e.preventDefault();
  return postData(`${process.env.API_URL}/user/login`, {
    email: "nsivadass@gmail.com",
    password: "33110055",
  })
    .then((data) => {
      console.log("login success", data.error);
    })
    .catch((err) => {
      console.log("====>", err);
    });
}
