import { useEffect, useState } from "react";
import config from "../config";
import "./Space.css";

// Компонент модального окна для добавления задачи
const AddTaskModal = ({ isOpen, onClose, onCreate, auth, spaceUuid }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`${config.API_URL}/tasks/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.jwt}`
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    space_uuid: spaceUuid
                })
            });
            
            if (response.ok) {
                onCreate();
                setTitle("");
                setDescription("");
            }
        } catch (error) {
            console.error("Ошибка создания задачи:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Создать задачу</h2>
                <input
                    type="text"
                    className="modal-input"
                    placeholder="Название задачи"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="modal-textarea"
                    placeholder="Описание (опционально)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                />
                <div className="modal-buttons">
                    <button
                        className="modal-btn modal-btn-create"
                        onClick={handleCreate}
                        disabled={!title.trim() || isLoading}
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

// Компонент модального окна для редактирования задачи
const EditTaskModal = ({ isOpen, onClose, onUpdate, auth, spaceUuid, task }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
        }
    }, [task, isOpen]);

    const handleUpdate = async () => {
        if (!title.trim()) return;
        
        setIsLoading(true);
        try {
            await fetch(`${config.API_URL}/tasks`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.jwt}`
                },
                body: JSON.stringify({
                    id: task.id,
                    space_uuid: spaceUuid,
                    title: title,
                    description: description,
                    completed: task.completed
                })
            });
            onUpdate();
        } catch (error) {
            console.error("Ошибка обновления задачи:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setTitle(task?.title || "");
        setDescription(task?.description || "");
        onClose();
    };

    if (!isOpen || !task) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Редактировать задачу</h2>
                <input
                    type="text"
                    className="modal-input"
                    placeholder="Название задачи"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="modal-textarea"
                    placeholder="Описание (опционально)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                />
                <div className="modal-buttons">
                    <button
                        className="modal-btn modal-btn-create"
                        onClick={handleUpdate}
                        disabled={!title.trim() || isLoading}
                    >
                        {isLoading ? "Сохранение..." : "Сохранить"}
                    </button>
                    <button className="modal-btn modal-btn-cancel" onClick={handleClose}>
                        Отменить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ({ auth, spaceUuid, setPage }) => {
    const [tasks, setTasks] = useState([]);
    const [spaceName, setSpaceName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);
    
    const handleCopyUuid = () => {
        navigator.clipboard.writeText(spaceUuid);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
    };
    
    const loadSpace = () => {
        fetch(`${config.API_URL}/spaces/${spaceUuid}`)
        .then(response => response.json())
        .then(data => {
            setSpaceName(data.name);
            setTasks(data.tasks);
        })
        .catch(err => console.error("Ошибка загрузки пространства:", err));
    };

    useEffect(() => {
        loadSpace();
    }, [spaceUuid, auth.jwt]);

    const handleTaskCreated = () => {
        setIsModalOpen(false);
        loadSpace();
    };

    const handleEditTaskOpen = (task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
    };

    const handleEditTaskUpdate = () => {
        setIsEditModalOpen(false);
        setEditingTask(null);
        loadSpace();
    };

    const handleTaskToggle = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            await fetch(`${config.API_URL}/tasks`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.jwt}`
                },
                body: JSON.stringify({
                    id: taskId,
                    space_uuid: spaceUuid,
                    title: task.title,
                    description: task.description,
                    completed: !task.completed
                })
            });
            loadSpace();
        } catch (error) {
            console.error("Ошибка обновления задачи:", error);
        }
    };

    const handleTaskDelete = async (taskId) => {
        try {
            await fetch(`${config.API_URL}/tasks/${taskId}?space_uuid=${spaceUuid}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${auth.jwt}`
                }
            });
            loadSpace();
        } catch (error) {
            console.error("Ошибка удаления задачи:", error);
        }
    };

    return (
        <div className="space-container">
            <div className="space-header">
                <a className="back-link" onClick={() => setPage("home")}>
                    ← Вернуться в пространства
                </a>
                <h1 className="space-title">{spaceName}</h1>
                <div 
                    className={`space-uuid-container ${copiedToClipboard ? 'copied' : ''}`}
                    onClick={handleCopyUuid}
                    title="Клик для копирования UUID"
                >
                    <span className="space-uuid">{spaceUuid}</span>
                    <span className="copy-indicator">{copiedToClipboard ? '✓ Скопировано!' : 'Копировать'}</span>
                </div>
            </div>

            <div className="tasks-wrapper">
                <div className="tasks-header">
                    <h2 className="tasks-title">Задачи</h2>
                    <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>
                        + Добавить задачу
                    </button>
                </div>

                {tasks && tasks.length > 0 ? (
                    <div className="tasks-container">
                        {tasks.map(task => (
                            <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                                <div className="task-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={task.completed || false}
                                        onChange={() => handleTaskToggle(task.id)}
                                    />
                                </div>
                                <div className="task-content">
                                    <h3 className="task-title">{task.title}</h3>
                                    {task.description && <p className="task-description">{task.description}</p>}
                                </div>
                                <button 
                                    className="task-edit-btn"
                                    onClick={() => handleEditTaskOpen(task)}
                                    title="Редактировать задачу"
                                >
                                    ✎
                                </button>
                                <button 
                                    className="task-delete-btn"
                                    onClick={() => handleTaskDelete(task.id)}
                                    title="Удалить задачу"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">✓</div>
                        <p>Нет задач. Создайте первую задачу!</p>
                    </div>
                )}
            </div>

            <AddTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleTaskCreated}
                auth={auth}
                spaceUuid={spaceUuid}
            />

            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleEditTaskUpdate}
                auth={auth}
                spaceUuid={spaceUuid}
                task={editingTask}
            />
        </div>
    );
}