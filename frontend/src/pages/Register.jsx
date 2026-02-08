import { useState } from "react";
import "./Register.css";

export default ({ auth, setPage }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const register = () => {
        auth.register(username, password);
    }

    return (
        <div className="login-container">
            <h1>Регистрация</h1>
            <p>Создайте новый аккаунт</p>
            <input type="text" placeholder="Имя пользователя" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={register}>Зарегистрироваться</button>
            {auth.error && <div className="error">{auth.error}</div>}
            <div className="login-links">
                <span>Уже есть аккаунт?</span>
                <a onClick={() => setPage("login")}>Войти</a>
            </div>
        </div>
    );
}