import CodeMirror from "../scripts/codemirror/codemirror";
import "../scripts/codemirror/addon/edit/closebrackets";
import "../scripts/codemirror/mode/javascript";
import { putData, postData, getData } from "./utils/fetch";
import { hasAnything } from "./utils/common";
const saveButton = document.querySelector("button.save");
const runButton = document.querySelector("button.run");
const loginButton = document.querySelector("button.login");
const runButtonEmpty = document.querySelector("button.run-empty");
const clearAllButton = document.querySelector("button.clear-all");
const jsCodeField = document.getElementById("jsCode");
const projectNameField = document.querySelector("input.project-name");

saveButton.addEventListener("click", save);
runButton.addEventListener("click", showPreview);
runButtonEmpty.addEventListener("click", showPreview);
loginButton.addEventListener("click", goToLogin);
clearAllButton.addEventListener("click", clearAll);
const accessToken = localStorage.getItem("accessToken");
var urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id") || "";

var iframe = document.getElementById("output-iframe");
var iframeWin = iframe.contentWindow || iframe;
let consoleLogsContainer = document.getElementById("console-logs");
let consoleLogsEmpty = document.getElementById("console-logs-empty");
let panel = parent.document.getElementById("console-logs");
let animationDelay = -1;
iframeWin.console = {
  panel: panel,
  log: function (...m) {
    let pre = parent.document.createElement("pre");
    animationDelay += 1;
    pre.setAttribute("class", "console-line-item");
    pre.style.setProperty("--animation-order", animationDelay);
    m.forEach((mItem) => {
      var newSpan = document.createElement("span");
      newSpan.setAttribute("class", typeof mItem);
      console.log(typeof mItem);
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
  console.log(accessToken);
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
  if (accessToken) {
    const headers = {
      Authorization: `token ${accessToken}`,
    };
    getData(`https://api.github.com/user`, headers)
      .then((data) => {
        console.log("user data", data);
        localStorage.setItem("user", JSON.stringify(data));
        loginButton.setAttribute("class", "logged-in");
        loginButton.firstElementChild.setAttribute("src", data.avatar_url);
        // loginButton.firstElementChild.setAttribute("class", "avatar");
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function goToLogin() {
  const loginURL = `https://github.com/login/oauth/authorize?scope=login&client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;
  window.location.href = loginURL;
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

window.addEventListener("load", main, false);
