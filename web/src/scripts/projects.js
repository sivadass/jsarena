import { getData } from "./utils/fetch";
const heroPlaceholder = document.querySelector(".hero-placeholder");

function main() {
  return getData(`${process.env.API_URL}/project`)
    .then((data) => {
      createListWithTemplate(data);
    })
    .catch((err) => {
      console.error(err);
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
