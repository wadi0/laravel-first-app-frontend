import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import {useAuth} from "../components/hooks/useAuth.jsx";
import path from "./path.jsx";

const PrivateRoute = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Outlet /> : <Navigate to={path.login} />;
};

export default PrivateRoute;
