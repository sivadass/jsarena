import jwt_decode from "jwt-decode";
import { postData } from "./utils/fetch";

var urlParams = new URLSearchParams(window.location.search);
const sessionCode = urlParams.get("code") || "";

function main() {
  if (sessionCode) {
    return postData(`${process.env.API_URL}/user/github-authorize`, {
      sessionCode: sessionCode,
    })
      .then((data) => {
        const token = data["authToken"];
        const user = jwt_decode(token);
        localStorage.setItem("JSA_AuthToken", token);
        localStorage.setItem("JSA_User", JSON.stringify(user));
        const lastURL = localStorage.getItem("JSA_LastURL");
        window.location.href = lastURL || "/";
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/";
      });
  }
  window.location.href = "/";
}

window.addEventListener("load", main, false);
