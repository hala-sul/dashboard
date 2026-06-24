import api from "./axios";

export const login = (email, password) => {
  return api.post("/auth/authenticate", {
    email,
    password,
  });
};

export const logout = () => {
  return api.get("/auth/logout");
};

export const refreshToken = () => {
  return api.get("/auth/refresh-token");
};

export const changePassword = (data) => {
  return api.patch("/auth/change-password", data);
};