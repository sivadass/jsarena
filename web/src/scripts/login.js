import jwt_decode from "jwt-decode";
import { postData } from "./utils/fetch";

const loginForm = document.getElementById("loginForm");
const submitButton = document.getElementById("submitButton");
const errorMessage = document.getElementById("errorMessage");

function main() {
  const persistedToken = localStorage.getItem("JSA_AuthToken");
  const lastURL = localStorage.getItem("JSA_LastURL");

  const user = persistedToken ? jwt_decode(persistedToken) : null;
  if (user) {
    window.location.href = lastURL || "/";
  }
}

async function loginUser(e) {
  e.preventDefault();
  submitButton.innerHTML = "Logging in...";
  errorMessage.innerHTML = "";
  const formData = new FormData(loginForm);
  const body = Object.fromEntries(formData);
  try {
    const response = await postData(`${process.env.API_URL}/user/login`, body);
    console.log(response);
  } catch (error) {
    const message = error?.message || "Oops, login failed, please retry!";
    errorMessage.innerHTML = `${message}`;
  } finally {
    submitButton.innerHTML = "Login";
  }
}

loginForm.addEventListener("submit", loginUser);

window.addEventListener("load", main, false);
