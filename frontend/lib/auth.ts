import { setToken, clearToken } from "./axios";

interface AuthState {
  user_id: string;
  email: string;
  role: string;
}

let currentUser: AuthState | null = null;

export const setUser = (user: AuthState, token: string) => {
  currentUser = user;
  setToken(token);
};

export const getUser = () => currentUser;

export const logout = () => {
  currentUser = null;
  clearToken();
  window.location.href = "/login";
};

export const isLoggedIn = () => currentUser !== null;