import Toastify from "./toast";

const authToken = localStorage.getItem("JSA_AuthToken") || "";

export async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && {
        "Auth-Token": authToken,
      }),
    },
    body: JSON.stringify(data),
  });
  const responseJSON = await response.json();
  if (response.status >= 200 && response.status < 400) {
    return responseJSON;
  } else {
    const errorMessage = responseJSON?.message || "Unknown error!";
    return Promise.reject(new Error(errorMessage));
  }
}

export async function putData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "PUT",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && {
        "Auth-Token": authToken,
      }),
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then((text) => {
      throw new Error(text);
    });
  }
}

export async function getData(url = "", options = {}) {
  const headers = {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && {
        "Auth-Token": authToken,
      }),
      ...options,
    },
  };
  const response = await fetch(url, headers);
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then((text) => {
      throw new Error(text);
    });
  }
}

export function handleError(error) {
  const { message = "" } = error;
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    className: "toastify-error",
  }).showToast();
  if (error.message) {
    if (message === "Not found!") {
      window.location.href = "/not-found.html";
    }
    if (["Access denied!", "Unauthorized!"].includes(message)) {
      if (message === "Unauthorized!") {
        localStorage.setItem("JSA_LastURL", window.location.href);
      }
      window.location.href = "/unauthorized.html";
    }
  }
  return;
}
