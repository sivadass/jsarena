import { putData } from "./utils/fetch";

var urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

var contentWindow = document.getElementById("output").contentWindow;

function main() {
  const runButton = document.querySelector("button.run");
  runButton.addEventListener("click", showPreview);
}

function showPreview() {
  var jsCode = document.getElementById("jsCode").value;
  return putData(
    `https://jsconsole-api.herokuapp.com/api/v1/project/${projectId}`,
    {
      name: "testing-code",
      code: jsCode,
    }
  )
    .then((data) => {
      console.log(data); // JSON data parsed by `data.json()` call
      contentWindow.eval(jsCode);
    })
    .catch((err) => {
      console.log(err);
    });
}

window.addEventListener("load", main, false);
