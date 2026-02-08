import { useEffect, useState } from "react";
import config from "../config";
import "./Home.css";

// Компонент модального окна для создания пространства
const CreateSpaceModal = ({ isOpen, onClose, onCreate, auth }) => {
    const [spaceName, setSpaceName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!spaceName.trim()) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`${config.API_URL}/spaces/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.jwt}`
                },
                body: JSON.stringify({ name: spaceName })
            });
            
            if (response.ok) {
                onCreate();
                setSpaceName("");
            }
        } catch (error) {
            console.error("Ошибка создания пространства:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSpaceName("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Создать пространство</h2>
                <input
                    type="text"
                    className="modal-input"
                    placeholder="Название пространства"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && spaceName.trim() && handleCreate()}
                />
                <div className="modal-buttons">
                    <button
                        className="modal-btn modal-btn-create"
                        onClick={handleCreate}
                        disabled={!spaceName.trim() || isLoading}
                    >
                        {isLoading ? "Создание..." : "Создать"}
                    </button>
                    <button className="modal-btn modal-btn-cancel" onClick={handleClose}>
                        Отменить
                    </button>
                </div>
            </div>
        </div>
    );
};

// Компонент модального окна для входа в пространство по ID
const JoinSpaceModal = ({ isOpen, onClose, onJoin, openSpace }) => {
    const [spaceId, setSpaceId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleJoin = async () => {
        if (!spaceId.trim()) return;
        
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch(`${config.API_URL}/spaces/${spaceId}`);
            
            if (response.ok) {
                openSpace(spaceId);
                setSpaceId("");
                onClose();
            } else {
                setError("Пространство не найдено");
            }
        } catch (error) {
            console.error("Ошибка входа в пространство:", error);
            setError("Ошибка при входе в пространство");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSpaceId("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Войти в пространство</h2>
                <input
                    type="text"
                    className="modal-input"
                    placeholder="Введите ID пространства"
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && spaceId.trim() && handleJoin()}
                />
                {error && <div className="modal-error">{error}</div>}
                <div className="modal-buttons">
                    <button
                        className="modal-btn modal-btn-create"
                        onClick={handleJoin}
                        disabled={!spaceId.trim() || isLoading}
                    >
                        {isLoading ? "Вход..." : "Войти"}
                    </button>
                    <button className="modal-btn modal-btn-cancel" onClick={handleClose}>
                        Отменить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ({ auth, openSpace }) => {
    const [spaces, setSpaces] = useState([]);
    const [username, setUsername] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const loadSpaces = () => {
        fetch(`${config.API_URL}/spaces/me`, {
            headers: {
                "Authorization": `Bearer ${auth.jwt}`
            }
        })
        .then(res => res.json())
        .then(data => setSpaces(data))
        .catch(err => console.error("Ошибка загрузки пространств"));
    };

    useEffect(() => {
        if (auth.jwt) {
            fetch(`${config.API_URL}/users/me`, {
                headers: {
                    "Authorization": `Bearer ${auth.jwt}`
                }
            })
            .then(res => res.json())
            .then(data => setUsername(data.username))
            .catch(err => console.error("Ошибка загрузки профиля"));
        }

        loadSpaces();
    }, [auth.jwt]);

    const handleCreateSpace = () => {
        setIsModalOpen(false);
        loadSpaces();
    };

    return (
        <div className="home-container">
            <div className="home-top">
                <div className="user-info">
                    <span className="username">👤 {username}</span>
                </div>
                <div className="logout" onClick={auth.logout}>Выйти</div>
            </div>

            <div className="spacer-line"></div>

            <div className="spaces-container">
                <div className="spaces-header">
                    <h1 className="spaces-title">Мои пространства</h1>
                    <div className="spaces-buttons">
                        <button className="create-space-btn" onClick={() => setIsModalOpen(true)}>
                            + Создать пространство
                        </button>
                        <button className="join-space-btn" onClick={() => setIsJoinModalOpen(true)}>
                            🔗 Войти по ID
                        </button>
                    </div>
                </div>
                <div className="spaces-list">
                    {spaces.map(space => (
                        <div key={space.uuid} className="space-card" onClick={() => openSpace(space.uuid)}>
                            <div className="space-icon">📁</div>
                            <div className="space-name">{space.name}</div>
                            <div className="space-info">
                            </div>
                        </div>
                    ))}
                </div>

                {(!spaces || spaces.length === 0) && (
                    <div className="empty-state-inline">
                        <div className="empty-state-icon">📭</div>
                        <p>Создайте первое пространство для начала работы</p>
                    </div>
                )}
            </div>

            <CreateSpaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateSpace}
                auth={auth}
            />

            <JoinSpaceModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onJoin={handleCreateSpace}
                openSpace={openSpace}
            />
        </div>
    );
}