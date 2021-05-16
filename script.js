const runButton = document.querySelector("button.run");

function showPreview() {
  var jsCode = document.getElementById("jsCode").value;
  var contentWindow = document.getElementById("output").contentWindow;
  contentWindow.eval(jsCode);
}

runButton.addEventListener("click", showPreview);
