export function hasAnything(selector) {
  return document.querySelector(selector).innerHTML.trim().length > 0;
}

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getOS = () => {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];
  let os = null;
  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "MacOS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux";
  }
  return os;
};

export const clearAuthData = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
};

export const login = () => {
  clearAuthData();
  const loginURL = `https://github.com/login/oauth/authorize?scope=user&client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;
  window.location.href = loginURL;
};

export const logout = () => {
  clearAuthData();
  window.location.href = "/";
};

export const initializeHeader = () => {
  const loginButton = document.querySelector("button.login");
  const logoutButton = document.querySelector("button.logout");
  const accountButton = document.querySelector("button.account");
  const accountLabel = accountButton.getElementsByTagName("span")[0];
  const accountDetails = document.querySelector(".account-details");
  const user = localStorage.getItem("user");

  const toggleAccountDropdown = () => {
    accountDetails.classList.toggle("open");
  };

  loginButton.addEventListener("click", login);
  logoutButton.addEventListener("click", logout);
  accountButton.addEventListener("click", toggleAccountDropdown);

  if (user) {
    const userData = JSON.parse(user);
    loginButton.remove();
    accountLabel.textContent = userData.name;
  } else {
    accountButton.remove();
  }
};
