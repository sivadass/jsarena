import jwt_decode from "jwt-decode";
import { postData } from "./utils/fetch";

const registerForm = document.getElementById("registerForm");
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

async function registerUser(e) {
  e.preventDefault();
  submitButton.innerHTML = "Registering...";
  errorMessage.innerHTML = "";
  const formData = new FormData(registerForm);
  const body = Object.fromEntries(formData);
  try {
    const response = await postData(
      `${process.env.API_URL}/user/register`,
      body
    );
    console.log(response);
  } catch (error) {
    const message =
      error?.message || "Oops, registeration failed, please retry!";
    errorMessage.innerHTML = `${message}`;
  } finally {
    submitButton.innerHTML = "Register";
  }
}

registerForm.addEventListener("submit", registerUser);

window.addEventListener("load", main, false);
