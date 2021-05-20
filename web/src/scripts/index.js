import { postData } from "./utils/fetch";
const createButton = document.querySelector("button.create");

function main() {
  console.log("page loaded");
}

function createNewProject() {
  return postData(`${process.env.API_URL}/project/`, {
    name: "testing-code",
    code: `console.log("hello world")`,
  }).then((data) => {
    const currentLocation = window.location.href;
    console.log("window.location.href", currentLocation);
    window.location = `${currentLocation}editor.html?id=${data._id}`;
    // document.getElementById("jsCode").value = data.code;
    console.log(data); // JSON data parsed by `data.json()` call
  });
}

createButton.addEventListener("click", createNewProject);

window.addEventListener("load", main, false);
