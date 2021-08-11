import { postData } from "./utils/fetch";
import { jwtDecode } from "./utils/jwtDecode";

var urlParams = new URLSearchParams(window.location.search);
const sessionCode = urlParams.get("code") || "";

function main() {
  if (sessionCode) {
    return postData(`${process.env.API_URL}/user/github-authorize`, {
      sessionCode: sessionCode,
    })
      .then((data) => {
        const token = data["auth-token"];
        console.log("token", token);
        const user = jwtDecode(token);
        console.log("user", user);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/";
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/";
      });
  }
  window.location.href = "/";
}

window.addEventListener("load", main, false);
