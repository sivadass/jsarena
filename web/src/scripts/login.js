import { postData } from "./utils/fetch";

const form = document.querySelector("#loginForm");
const authError = document.querySelector(".auth-error");
form.addEventListener("submit", login);

function login(e) {
  e.preventDefault();
  authError.style.display = "none";
  authError.innerHTML = null;
  const {
    email: { value: emailVal },
    password: { value: passwordVal },
  } = form.elements;
  return postData(`${process.env.API_URL}/user/login`, {
    email: emailVal,
    password: passwordVal,
  })
    .then((data) => {
      console.log("login success");
    })
    .catch((err) => {
      authError.style.display = "block";
      authError.innerHTML = err;
    });
}
