import { postData } from "./utils/fetch";

var urlParams = new URLSearchParams(window.location.search);
const sessionCode = urlParams.get("code") || "";

function main() {
  if (sessionCode) {
    return postData(`${process.env.API_URL}/user/github-authorize`, {
      sessionCode: sessionCode,
    })
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/";
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/";
      });
  }
  return;
}

window.addEventListener("load", main, false);
