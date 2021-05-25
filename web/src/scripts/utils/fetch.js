export async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    return response.json();
  } else {
    console.error("in fetch handler ==>", response.text());
    throw new Error("Something went wrong");
  }
}

export async function putData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "PUT",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    return response.json();
  } else {
    console.error("in fetch handler ==>", response.body);
    throw new Error("Something went wrong");
  }
}

export async function getData(url = "") {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    return response.json();
  } else {
    console.error("in fetch handler ==>", response);
    throw new Error("Something went wrong");
  }
}
