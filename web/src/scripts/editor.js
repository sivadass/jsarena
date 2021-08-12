import CodeMirror from "../scripts/codemirror/codemirror";
import "../scripts/codemirror/addon/edit/closebrackets";
import "../scripts/codemirror/mode/javascript";
import { putData, postData, getData } from "./utils/fetch";
import { hasAnything, debounce, getOS } from "./utils/common";
const saveButton = document.querySelector("button.save");
const runButton = document.querySelector("button.run");
const loginButton = document.querySelector("button.login");
const runButtonEmpty = document.querySelector("button.run-empty");
const clearAllButton = document.querySelector("button.clear-all");
const jsCodeField = document.getElementById("jsCode");
const projectNameField = document.querySelector("input.project-name");
const authLabel = loginButton.getElementsByTagName("span")[0];

saveButton.addEventListener("click", save);
runButton.addEventListener("click", showPreview);
runButtonEmpty.addEventListener("click", showPreview);
loginButton.addEventListener("click", goToLogin);
clearAllButton.addEventListener("click", clearAll);
const user = localStorage.getItem("user");
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

let iframe = document.getElementById("output-iframe");
let iframeWin = iframe.contentWindow || iframe;
let consoleLogsContainer = document.getElementById("console-logs");
let consoleLogsEmpty = document.getElementById("console-logs-empty");
let panel = parent.document.getElementById("console-logs");
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
  // extraKeys: {
  //   "Ctrl-/": editor.execCommand("toggleComment"),
  // },
});

editor.on(
  "change",
  debounce(() => save(), 1000)
);

function main() {
  const OS = getOS();
  saveButton.getElementsByTagName("span")[0].innerText =
    OS === "MacOS" ? "CMD+S" : "CTRL+S";
  runButton.getElementsByTagName("span")[0].innerText =
    OS === "MacOS" ? "CMD+R" : "CTRL+R";
  clearAllButton.getElementsByTagName("span")[0].innerText =
    OS === "MacOS" ? "CMD+L" : "CTRL+L";
  if (projectId) {
    getData(`${process.env.API_URL}/project/${projectId}`)
      .then((data) => {
        editor.setValue(data.code);
        projectNameField.value = data.name;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  if (user) {
    const userData = JSON.parse(user);
    loginButton.setAttribute("class", "logged-in");
    loginButton.removeChild(loginButton.children[0]);
    authLabel.textContent = userData.name;
  }
}

function goToLogin() {
  localStorage.removeItem("user");
  const loginURL = `https://github.com/login/oauth/authorize?scope=user&client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;
  window.location.href = loginURL;
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

function save() {
  var jsCode = editor.getValue();
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
        console.error(err);
      })
      .finally(() => {
        savingAnimation(false);
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
        console.error(err);
      })
      .finally(() => {
        savingAnimation(false);
      });
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
    save();
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

window.addEventListener("load", main, false);
window.addEventListener("keydown", hotKeys, false);
