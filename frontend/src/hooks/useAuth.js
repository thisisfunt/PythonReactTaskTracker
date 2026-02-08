import { useState } from "react";
import config from "../config";


export default () => {
    const [jwt, setJwt] = useState();
    const [error, setError] = useState();

    const login = (username, password) => {
        fetch(config.API_URL+"/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => setJwt(data.token))
        .catch(err => setError("Ошибка авторизации"));
    }

    const logout = () => {
        setJwt(null);
    }

    const register = (username, password) => {
        fetch(config.API_URL+"/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(
            () => login(username, password)
        )
        .catch(err => setError("Ошибка регистрации"));
    }

    return {
        jwt,
        error,
        
        login,
        logout,
        register
    };
}