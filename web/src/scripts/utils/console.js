function customLogger() {
  var old_logger = console.log;
  var html_logger = document.getElementById("debugDiv");
  console.log = function (msg) {
    old_logger.call(this, arguments);
    if (typeof msg == "object") {
      html_logger.innerHTML +=
        (JSON && JSON.stringify ? JSON.stringify(msg, null, 2) : msg) + "<br>";
    } else {
      html_logger.innerHTML += msg + "<br>";
    }
  };
}

customLogger();
