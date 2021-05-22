import { putData, postData, getData } from "./utils/fetch";
const saveButton = document.querySelector("button.save");
const runButton = document.querySelector("button.run");
const jsCodeField = document.getElementById("jsCode");
const projectNameField = document.querySelector("input.project-name");

saveButton.addEventListener("click", save);
runButton.addEventListener("click", showPreview);
var urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

var iframe = document.getElementById("output-iframe");
var iframeWin = iframe.contentWindow || iframe;

function main() {
  if (projectId) {
    return getData(`${process.env.API_URL}/project/${projectId}`)
      .then((data) => {
        jsCodeField.value = data.code;
        projectNameField.value = data.name;
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
      name: projectNameField.value,
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
      name: projectNameField.value,
      code: `${jsCode}`,
    })
      .then((data) => {
        iframeWin.eval(jsCode);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function showPreview() {
  var jsCode = document.getElementById("jsCode").value;
  const loggerCode = `
    let panel = parent.document.getElementById("console-logs");
    var console = {
        panel: panel,
        log: function(m){
            let pre = parent.document.createElement("pre");
            pre.setAttribute("class","console-line-item");
            pre.textContent = typeof m === 'object' ? JSON.stringify(
              m,
              null,
              2
            ) : m;
            this.panel.prepend(pre);
        }
    };
  `;
  const codeToRun = `
    ${loggerCode}
    ${jsCode}
  `;
  iframeWin.eval(codeToRun);
}

window.addEventListener("load", main, false);
