import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const authStorage = {
  // Access Token
  getAccessToken: () => Cookies.get(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 1 / 24 }); // 1 hour
  },
  removeAccessToken: () => Cookies.remove(ACCESS_TOKEN_KEY),

  // Refresh Token
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => {
    Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 7 }); // 7 days
  },
  removeRefreshToken: () => Cookies.remove(REFRESH_TOKEN_KEY),

  // User
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: object) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser: () => localStorage.removeItem(USER_KEY),

  // Clear all
  clearAll: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if logged in
  isLoggedIn: () => !!Cookies.get(ACCESS_TOKEN_KEY)
};
