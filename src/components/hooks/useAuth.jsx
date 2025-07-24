import {useState} from "react";

export const useAuth = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return {
        isLoggedIn: !!user?.token,
        user
    };
};
