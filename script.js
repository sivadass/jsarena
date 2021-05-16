const runButton = document.querySelector("button.run");

function showPreview() {
  var jsCode = document.getElementById("jsCode").value;
  var contentWindow = document.getElementById("output").contentWindow;
  var result = contentWindow.eval(jsCode);
  console.log(result);
  const frame = contentWindow.document;
  frame.open();
  frame.write(result);
  frame.close();
}

runButton.addEventListener("click", showPreview);
