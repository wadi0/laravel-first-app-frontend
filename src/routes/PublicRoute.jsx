import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import {useAuth} from "../components/hooks/useAuth.jsx";
import path from "./path.jsx";

const PublicRoute = () => {
  const { isLoggedIn } = useAuth();
  return !isLoggedIn ? <Outlet /> : <Navigate to={path.home} />;
};

export default PublicRoute;
