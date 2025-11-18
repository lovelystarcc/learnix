import { useState } from "react";
import { createTeacher } from "../api/teacher";

const TeacherApplicationModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    bio: "",
    specialization: "",
    technologies: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user || !user.id) {
      setError("Необходимо войти в систему");
      setLoading(false);
      return;
    }

    if (!formData.specialization.trim()) {
      setError("Специализация обязательна для заполнения");
      setLoading(false);
      return;
    }

    try {
      const data = await createTeacher(
        formData.bio,
        formData.specialization,
        formData.technologies
      );
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(data);
        onClose();
        setFormData({
          bio: "",
          specialization: "",
          technologies: "",
        });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Ошибка создания преподавателя:", err);
      setError(err.message || "Не удалось отправить заявку");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>Подать заявку на преподавателя</h2>
        <p className="modal-subtitle">
          Заполните форму, чтобы стать преподавателем на платформе
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            Заявка успешно отправлена! Вы стали преподавателем.
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="specialization">Специализация</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                placeholder="Например: Python Developer, UX/UI Designer"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">О себе (биография)</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Расскажите о своем опыте, достижениях и подходе к обучению..."
                value={formData.bio}
                onChange={handleChange}
                rows="5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="technologies">Технологии</label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                placeholder="Например: Python, JavaScript, React, Node.js (через запятую)"
                value={formData.technologies}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Отправка..." : "Подать заявку"}
            </button>
          </form>
        )}

        {!success && (
          <div className="modal-footer">
            <p>
              После подачи заявки ваша информация будет проверена администрацией
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherApplicationModal;

