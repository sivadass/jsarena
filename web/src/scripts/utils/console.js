var consoleLogsDiv = document.getElementById("consoleLogs");
const template = document.getElementById("consoleItem");

console.defaultLog = console.log.bind(console);
console.logs = [];
console.log = function () {
  // default &  console.log()
  console.defaultLog.apply(console, arguments);
  // new & array data
  console.logs.push(Array.from(arguments));

  console.logs.forEach((argArray) => {
    argArray.forEach((arg) => {
      const codeBlock = document.importNode(template.content, true);
      if (typeof arg === "string") {
        codeBlock.querySelector(".console-result").textContent =
          arg || "nothing to log";
      }
      if (typeof arg === "object") {
        codeBlock.querySelector(".console-result").textContent = JSON.stringify(
          arg,
          null,
          2
        );
      }
      consoleLogsDiv.appendChild(codeBlock);
    });
  });
};

// Const syntaxHightlight Script
export const syntaxHighlight = (json) => {
  console.log({ json });
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
};
