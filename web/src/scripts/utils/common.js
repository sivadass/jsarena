export function hasAnything(selector) {
  return document.querySelector(selector).innerHTML.trim().length > 0;
}
