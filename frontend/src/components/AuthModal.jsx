import { login, register } from "../api/auth";
import { useState, useEffect } from "react";

const AuthModal = ({ 
  isOpen, 
  onClose, 
  mode = "login", 
  onToggleMode, 
  onSuccess
}) => {
  const isLoginMode = mode === "login";
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Controlled form fields
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
      });
      setToastMessage("");
    }
  }, [isOpen, mode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { email, password, confirmPassword, fullName } = formData;

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        showToast("Пароли не совпадают");
        return;
      }
      if (password.length < 8) {
        showToast("Пароль должен содержать минимум 8 символов");
        return;
      }
      if (!fullName.trim()) {
        showToast("Введите ваше полное имя");
        return;
      }
    }

    setLoading(true);

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
        data = await register(email, password, fullName.trim(), "student");
        showToast("Регистрация прошла успешно! Войдите в систему.");
        setTimeout(() => {
          onToggleMode();
        }, 1500);
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      showToast(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div id="authModal" className="modal" onClick={onClose}>
        <div className="modal-overlay"></div>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>

          <h2 id="modalTitle">{isLoginMode ? "Вход в систему" : "Регистрация"}</h2>
          <p className="modal-subtitle">
            {isLoginMode ? "Войдите, чтобы продолжить обучение" : "Создайте аккаунт, чтобы начать"}
          </p>

          <form id="authForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль" 
                required 
              />
            </div>
            {!isLoginMode && (
              <>
                <div className="form-group">
                  <label>Подтверждение пароля</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Повторите пароль" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Полное имя</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Иван Петров" 
                    required 
                  />
                </div>
              </>
            )}
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Продолжить"}
            </button>
          </form>

          <div className="modal-footer">
            <p id="toggleText">
              {isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <a onClick={onToggleMode} style={{ cursor: "pointer" }}>
                {isLoginMode ? "Зарегистрироваться" : "Войти"}
              </a>
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default AuthModal;
