import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TeacherCard from "../components/TeacherCard";
import AuthModal from "../components/AuthModal";
import TeacherApplicationModal from "../components/TeacherApplicationModal";

const TeachersPage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "login" });
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #5f72bd 0%, #9921e8 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Не удалось восстановить пользователя");
          return res.json();
        })
        .then((data) => {
          setUser({
            id: data.id,
            email: data.email,
            fullName: data.full_name || data.fullName || data.email,
          });
        })
        .catch((err) => {
          console.error("Ошибка восстановления пользователя:", err);
          localStorage.removeItem("token");
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:8080/teacher");
      if (!response.ok) throw new Error("Ошибка загрузки преподавателей");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Ошибка загрузки преподавателей:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Функция для получения имени преподавателя (пока используем user_id, так как нет связи с users)
  const getTeacherName = (teacher) => {
    // TODO: Когда будет связь с users, получать имя оттуда
    return `Преподаватель #${teacher.user_id}`;
  };

  return (
    <>
      <Header
        user={user}
        authLoading={authLoading}
        onLogin={() => setModalState({ open: true, mode: "login" })}
        onRegister={() => setModalState({ open: true, mode: "register" })}
        onToggleMenu={() => console.log("Мобильное меню")}
      />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Наши преподаватели</h1>
          <p className="page-subtitle">
            Опытные специалисты с реальным опытом работы в индустрии
          </p>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <p>Загрузка преподавателей...</p>
          ) : teachers.length === 0 ? (
            <div className="no-results">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="28" cy="28" r="18" strokeWidth="3" />
                <path d="M42 42l14 14" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <h3>Преподаватели не найдены</h3>
              <p>Пока нет зарегистрированных преподавателей</p>
            </div>
          ) : (
            <div className="teachers-grid">
              {teachers.map((teacher, index) => (
                <TeacherCard
                  key={teacher.user_id}
                  userID={teacher.user_id}
                  name={getTeacherName(teacher)}
                  specialization={teacher.specialization}
                  bio={teacher.bio}
                  technologies={teacher.technologies}
                  coursesCount={teacher.courses_count}
                  studentsCount={teacher.students_count}
                  rating="4.5"
                  gradient={gradients[index % gradients.length]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Хотите стать преподавателем?</h2>
            <p>
              Поделитесь своими знаниями с тысячами студентов и зарабатывайте на
              обучении
            </p>
            <button
              className="btn btn-white btn-lg"
              onClick={() => {
                if (!user) {
                  setPendingApplication(true);
                  setModalState({ open: true, mode: "register" });
                } else {
                  setApplicationModalOpen(true);
                }
              }}
            >
              Подать заявку
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, mode: "login" })}
        mode={modalState.mode}
        onToggleMode={() =>
          setModalState({
            open: true,
            mode: modalState.mode === "login" ? "register" : "login",
          })
        }
        onSuccess={(userData) => {
          setUser(userData);
          // После успешного входа, если пользователь хотел подать заявку, открываем форму
          if (pendingApplication) {
            setPendingApplication(false);
            setApplicationModalOpen(true);
          }
        }}
      />

      <TeacherApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        user={user}
        onSuccess={() => {
          // Обновляем список преподавателей после успешного создания
          fetchTeachers();
          setApplicationModalOpen(false);
        }}
      />
    </>
  );
};

export default TeachersPage;

