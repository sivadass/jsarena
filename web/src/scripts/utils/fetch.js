const authToken = localStorage.getItem("authToken") || "";
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
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then((text) => {
      console.log("==>", text);
      throw new Error(text);
    });
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
