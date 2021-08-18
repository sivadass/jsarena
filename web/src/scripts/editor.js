import CodeMirror from "../scripts/codemirror/codemirror";
import "../scripts/codemirror/addon/edit/closebrackets";
import "../scripts/codemirror/mode/javascript";
import { putData, postData, getData, handleError } from "./utils/fetch";
import Toastify from "../scripts/utils/toast";
import {
  hasAnything,
  debounce,
  getOS,
  initializeHeader,
  login,
} from "./utils/common";
const saveButton = document.querySelector("button.save");
const runButton = document.querySelector("button.run");
const runButtonEmpty = document.querySelector("button.run-empty");
const clearAllButton = document.querySelector("button.clear-all");
const shareButton = document.querySelector("button.share");
const jsCodeField = document.getElementById("jsCode");
const layoutContainer = document.querySelector("main.editor");
const layoutSeparator = document.querySelector("div.layout-separator");
const codeColumn = document.querySelector("div.code");
const consoleColumn = document.querySelector("div.console");
const projectNameField = document.querySelector("input.project-name");
const user = localStorage.getItem("user");

saveButton.addEventListener("click", saveCode);
runButton.addEventListener("click", showPreview);
runButtonEmpty.addEventListener("click", showPreview);
clearAllButton.addEventListener("click", clearAll);
shareButton.addEventListener("click", share);
layoutSeparator.addEventListener("mousedown", resizeColumn);
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

let iframe = document.getElementById("output-iframe");
let iframeWin = iframe.contentWindow || iframe;
let consoleLogsContainer = document.getElementById("console-logs");
let consoleLogsEmpty = document.getElementById("console-logs-empty");
let panel = parent.document.getElementById("console-logs");
let isResizing = false;
let readOnly = false;
let animationDelay = -1;
iframeWin.console = {
  panel: panel,
  log: function (...m) {
    let tempId = Math.floor(Math.random() * 10000);
    let pre = parent.document.createElement("pre");
    let toggleSwitch = parent.document.createElement("input");
    let toggleSwitchLabel = parent.document.createElement("label");
    let logsWrapper = parent.document.createElement("div");
    animationDelay += 1;
    pre.setAttribute("class", "console-line-item");
    pre.style.setProperty("--animation-order", animationDelay);
    logsWrapper.setAttribute("class", "console-line-item-content");
    pre.appendChild(toggleSwitch);
    pre.appendChild(toggleSwitchLabel);
    pre.appendChild(logsWrapper);
    toggleSwitch.setAttribute("type", "checkbox");
    toggleSwitch.setAttribute("id", tempId);
    toggleSwitch.setAttribute("class", "console-line-item-switch");
    toggleSwitchLabel.setAttribute("for", tempId);
    m.forEach((mItem) => {
      var newSpan = document.createElement("span");
      newSpan.setAttribute("class", typeof mItem);
      newSpan.textContent +=
        typeof mItem === "object" ? JSON.stringify(mItem, null, 1) : mItem;
      logsWrapper.appendChild(newSpan);
    });
    pre.appendChild(logsWrapper);
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
  readOnly: readOnly,
});

editor.on(
  "change",
  debounce(() => save(), 1000)
);

// editor.on(
//   "refresh",
//   debounce(() => {
//     const { height } = codeColumn.getBoundingClientRect();
//     editor.setSize("100%", `${height - 36}px`);
//   }, 1000)
// );

function main() {
  const OS = getOS();
  if (user) {
    saveButton.getElementsByTagName("span")[0].innerText =
      OS === "MacOS" ? "CMD+S" : "CTRL+S";
  } else {
    saveButton.getElementsByTagName("span")[0].innerText = "Login & Save!";
  }
  runButton.getElementsByTagName("span")[0].innerText =
    OS === "MacOS" ? "CMD+R" : "CTRL+R";
  clearAllButton.getElementsByTagName("span")[0].innerText =
    OS === "MacOS" ? "CMD+L" : "CTRL+L";
  initializeHeader();
  const { height, width } = codeColumn.getBoundingClientRect();
  editor.setSize(`${width - 1}px`, `${height - 36}px`);
  if (projectId) {
    readOnly = true;
    getData(`${process.env.API_URL}/project/${projectId}`)
      .then((data) => {
        editor.setValue(data.code);
        projectNameField.value = data.name;
      })
      .catch((err) => {
        handleError(err);
      })
      .finally(() => {
        readOnly = false;
      });
  } else {
    const code = localStorage.getItem("JSA_Code") || "";
    editor.setValue(code);
  }
}

function savingAnimation(isStart = true) {
  var elements = document.getElementsByTagName("animate");
  saveButton.disabled = isStart;
  for (var i = 0; i < elements.length; i++) {
    if (isStart) {
      elements[i].beginElement();
    } else {
      elements[i].endElement();
    }
  }
}

function share() {
  navigator.clipboard.writeText(window.location.href);
  Toastify({
    text: "Share URL copied to clipboard",
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    className: "toastify-success",
  }).showToast();
}

function saveCode() {
  if (user) {
    save();
  } else {
    login();
  }
}

function save() {
  var jsCode = editor.getValue();
  readOnly = true;
  if (user) {
    savingAnimation(true);
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
          handleError(err);
        })
        .finally(() => {
          savingAnimation(false);
          localStorage.removeItem("JSA_Code");
          readOnly = false;
        });
    } else {
      putData(`${process.env.API_URL}/project/${projectId}`, {
        name: projectNameField.value,
        code: `${jsCode}`,
      })
        .then((data) => {
          // iframeWin.eval(jsCode);
        })
        .catch((err) => {
          handleError(err);
        })
        .finally(() => {
          savingAnimation(false);
          readOnly = false;
        });
    }
  } else {
    localStorage.setItem("JSA_Code", `${jsCode}`);
  }
}

function scrollToBottom() {
  const scrollHeight = consoleLogsContainer.scrollHeight;
  consoleLogsContainer.scrollTo({
    top: scrollHeight,
    left: 0,
    behavior: "smooth",
  });
}

function showPreview() {
  var jsCode = editor.getValue();
  animationDelay = -1;
  try {
    iframeWin.eval(jsCode);
    scrollToBottom();
  } catch (e) {
    console.log(e); // Check EvalError object
    iframeWin.console.error(`${e.name}: ${e.message}`);
    scrollToBottom();
  }
  if (!hasAnything("#console-logs")) {
    consoleLogsEmpty.classList.add("active");
  } else {
    consoleLogsEmpty.classList.remove("active");
  }
}

function clearAll() {
  consoleLogsContainer.replaceChildren();
  animationDelay = -1;
  consoleLogsEmpty.classList.add("active");
}

function hotKeys(e) {
  let windowEvent = window ? window.event : e;
  if (windowEvent.keyCode === 83 && windowEvent.metaKey) {
    e.preventDefault();
    saveCode();
  }
  if (
    (windowEvent.keyCode === 82 && windowEvent.metaKey) ||
    (windowEvent.keyCode === 82 && windowEvent.ctrlKey)
  ) {
    e.preventDefault();
    showPreview();
  }
  if (windowEvent.keyCode === 76 && windowEvent.metaKey) {
    e.preventDefault();
    clearAll();
  }
}

function resizeColumn() {
  isResizing = true;
}

function onMouseMove(e) {
  if (!isResizing) {
    return;
  }
  const { x, width } = layoutContainer.getBoundingClientRect();
  const separatorPosition = width - (e.clientX - x);
  const codeColumnWidth = `${width - separatorPosition}px`;
  const consoleColumnWidth = `${separatorPosition}px`;
  if (width - separatorPosition >= 420 && separatorPosition >= 360) {
    codeColumn.style.width = codeColumnWidth;
    consoleColumn.style.width = consoleColumnWidth;
  }
}

function onMouseUp() {
  isResizing = false;
}

console.log("==> ", readOnly);

window.addEventListener("load", main, false);
window.addEventListener("keydown", hotKeys, false);
document.addEventListener("mousemove", onMouseMove, false);
document.addEventListener("mouseup", onMouseUp, false);
