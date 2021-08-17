import { getData, handleError } from "./utils/fetch";
import { initializeHeader } from "./utils/common";
const heroPlaceholder = document.querySelector(".hero-placeholder");

function main() {
  initializeHeader();
  return getData(`${process.env.API_URL}/project`)
    .then((data) => {
      createListWithTemplate(data);
    })
    .catch((err) => {
      handleError(err);
    });
}

function createListWithTemplate(heroes) {
  const ul = document.createElement("ul");
  ul.classList.add("list", "hero-list");
  const template = document.getElementById("hero-template");
  heroes.forEach((hero) => {
    const heroCard = document.importNode(template.content, true);
    heroCard.querySelector(".card-link").href = `/?id=${hero._id}`;
    heroCard.querySelector(".description").textContent = hero.code;
    heroCard.querySelector(".name").textContent = hero.name;
    ul.appendChild(heroCard);
  });
  heroPlaceholder.replaceWith(ul);
}

window.addEventListener("load", main, false);
