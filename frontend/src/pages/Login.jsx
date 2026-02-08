import { useState } from "react";
import "./Login.css";
import config from "../config";


export default ({ auth, setPage }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = () => {
        auth.login(username, password);
    }

    return (
        <div className="login-container">
            <h1>Вход</h1>
            <p>Введите ваши учётные данные</p>
            <input type="text" placeholder="Имя пользователя" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={login}>Войти</button>
            {auth.error && <div className="error">{auth.error}</div>}
            <div className="login-links">
                <span>Нет аккаунта?</span>
                <a onClick={() => setPage("register")}>Зарегистрироваться</a>
            </div>
        </div>
    );
}