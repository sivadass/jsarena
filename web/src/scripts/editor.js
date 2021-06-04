import CodeMirror from "../scripts/codemirror/codemirror";
import "../scripts/codemirror/addon/edit/closebrackets";
import "../scripts/codemirror/mode/javascript";
import { putData, postData, getData } from "./utils/fetch";
const saveButton = document.querySelector("button.save");
const runButton = document.querySelector("button.run");
const clearAllButton = document.querySelector("button.clear-all");
const jsCodeField = document.getElementById("jsCode");
const projectNameField = document.querySelector("input.project-name");

saveButton.addEventListener("click", save);
runButton.addEventListener("click", showPreview);
clearAllButton.addEventListener("click", clearAll);
var urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

var iframe = document.getElementById("output-iframe");
var iframeWin = iframe.contentWindow || iframe;
let panel = parent.document.getElementById("console-logs");
iframeWin.console = {
  panel: panel,
  log: function (...m) {
    console.log(m);
    let pre = parent.document.createElement("pre");
    pre.setAttribute("class", "console-line-item");
    m.forEach((mItem) => {
      var newSpan = document.createElement("span");
      newSpan.textContent +=
        typeof mItem === "object" ? JSON.stringify(mItem) : mItem;
      pre.appendChild(newSpan);
    });
    this.panel.append(pre);
  },
  error: function (m) {
    let pre = parent.document.createElement("pre");
    pre.setAttribute("class", "console-line-item error");
    pre.textContent = typeof m === "object" ? JSON.stringify(m, null, 2) : m;
    this.panel.append(pre);
  },
};

var editor = CodeMirror.fromTextArea(jsCodeField, {
  lineWrapping: true,
  theme: "monokai",
  styleActiveLine: true,
  lineNumbers: true,
  matchBrackets: true,
  indentUnit: 4,
  indentWithTabs: true,
  autoCloseTags: true,
  autoCloseBrackets: true,
  // extraKeys: {
  //   "Ctrl-/": editor.execCommand("toggleComment"),
  // },
});

function main() {
  if (projectId) {
    return getData(`${process.env.API_URL}/project/${projectId}`)
      .then((data) => {
        editor.setValue(data.code);
        projectNameField.value = data.name;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  return;
}

function save() {
  var jsCode = editor.getValue();
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
  var jsCode = editor.getValue();
  try {
    iframeWin.eval(jsCode);
  } catch (e) {
    console.log(e); // Check EvalError object
    iframeWin.console.error(`${e.name}: ${e.message}`);
  }
}

function clearAll() {
  const consoleLogsContainer = document.getElementById("console-logs");
  consoleLogsContainer.replaceChildren();
}

window.addEventListener("load", main, false);
