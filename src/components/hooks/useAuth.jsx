import { useState } from "react";

export const useAuth = () => {
  const [isLoggedIn] = useState(!!localStorage.getItem("token")); // 'token' থাকলে logged in
  return { isLoggedIn };
};
