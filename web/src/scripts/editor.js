import { putData, postData, getData } from "./utils/fetch";
const saveButton = document.querySelector("button.save");
const runButton = document.querySelector("button.run");

saveButton.addEventListener("click", save);
runButton.addEventListener("click", showPreview);
var urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

var contentWindow = document.getElementById("output").contentWindow;

function main() {
  if (projectId) {
    return getData(`${process.env.API_URL}/project/${projectId}`)
      .then((data) => {
        console.log("==> ", data);
        var jsCodeField = document.getElementById("jsCode");
        jsCodeField.value = data.code;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  return;
}

function save() {
  var jsCode = document.getElementById("jsCode").value;
  if (!projectId) {
    postData(`${process.env.API_URL}/project`, {
      name: "testing-code",
      code: `${jsCode}`,
    })
      .then((data) => {
        const id = data._id;
        urlParams.set("id", id);
        window.location.search = urlParams.toString();
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    putData(`${process.env.API_URL}/project/${projectId}`, {
      name: "testing-code",
      code: `${jsCode}`,
    })
      .then(() => {
        contentWindow.eval(jsCode);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function showPreview() {
  var jsCode = document.getElementById("jsCode").value;
  putData(`${process.env.API_URL}/project/${projectId}`, {
    name: "testing-code",
    code: `${jsCode}`,
  })
    .then(() => {
      contentWindow.eval(jsCode);
    })
    .catch((err) => {
      console.error(err);
    });
}

window.addEventListener("load", main, false);
