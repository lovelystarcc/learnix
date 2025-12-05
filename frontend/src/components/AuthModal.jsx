import { login, register } from "../api/auth";
import { useState } from "react";

const AuthModal = ({ 
  isOpen, 
  onClose, 
  mode = "login", 
  onToggleMode, 
  onSuccess
}) => {
  const isLoginMode = mode === "login";
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form[0].value;
    const password = form[1].value;
    const confirmPassword = form[2]?.value;
    const fullName = form[3]?.value;

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        showToast("Пароли не совпадают");
        return;
      }
      if (password.length < 6) {
        showToast("Пароль должен содержать минимум 6 символов");
        return;
      }
    }

    try {
      let data;
      if (isLoginMode) {
        data = await login(email, password);
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        const userResponse = await fetch("http://localhost:8080/user/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          onSuccess?.({ 
            id: userData.id,
            email: userData.email, 
            fullName: userData.full_name || userData.fullName || userData.email,
            role: userData.role
          });
        } else {
          onSuccess?.({ email: data.email, fullName: data.fullName || data.full_name });
        }
        onClose();
      } else {
        data = await register(email, password, fullName, "student");
        showToast("Регистрация прошла успешно! Войдите в систему.");
        onToggleMode();
        // если сервер возвращает данные о пользователе, можно вызвать:
        // onSuccess?.({ email: data.email, fullName: data.fullName });
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      showToast("Ошибка: " + err.message);
    }
  };

  return (
    <>
      {isOpen && (
        <div id="authModal" className="modal">
          <div className="modal-overlay" onClick={onClose}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={onClose}>✕</button>

            <h2 id="modalTitle">{isLoginMode ? "Вход в систему" : "Регистрация"}</h2>
            <p className="modal-subtitle">
              {isLoginMode ? "Войдите, чтобы продолжить обучение" : "Создайте аккаунт, чтобы начать"}
            </p>

            <form id="authForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Пароль</label>
                <input type="password" placeholder="Введите пароль" required />
              </div>
              {!isLoginMode && (
                <>
                  <div className="form-group">
                    <label>Подтверждение пароля</label>
                    <input type="password" placeholder="Повторите пароль" required />
                  </div>
                  <div className="form-group">
                    <label>Полное имя</label>
                    <input type="text" placeholder="Иван Петров" required />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary btn-block">
                Продолжить
              </button>
            </form>

            <div className="modal-footer">
              <p id="toggleText">
                {isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                <a onClick={onToggleMode}>
                  {isLoginMode ? "Зарегистрироваться" : "Войти"}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default AuthModal;
