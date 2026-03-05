import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const COOKIE_OPTIONS = { path: "/" };

// Custom event emitter for user data changes (works within same tab)
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeUserChange(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const authStorage = {
  // Access Token
  getAccessToken: () => Cookies.get(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, token, { ...COOKIE_OPTIONS, expires: 1 / 24 }); // 1 hour
  },
  removeAccessToken: () => Cookies.remove(ACCESS_TOKEN_KEY, COOKIE_OPTIONS),

  // Refresh Token
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => {
    Cookies.set(REFRESH_TOKEN_KEY, token, { ...COOKIE_OPTIONS, expires: 7 }); // 7 days
  },
  removeRefreshToken: () => Cookies.remove(REFRESH_TOKEN_KEY, COOKIE_OPTIONS),

  // User
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: object) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notifyListeners();
  },
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
    notifyListeners();
  },

  // Clear all
  clearAll: () => {
    Cookies.remove(ACCESS_TOKEN_KEY, COOKIE_OPTIONS);
    Cookies.remove(REFRESH_TOKEN_KEY, COOKIE_OPTIONS);
    localStorage.removeItem(USER_KEY);
    notifyListeners();
  },

  // Check if logged in
  isLoggedIn: () => !!Cookies.get(ACCESS_TOKEN_KEY)
};
