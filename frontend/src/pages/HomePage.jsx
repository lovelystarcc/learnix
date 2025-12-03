import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import FeatureCard from "../components/FeatureCard";
import CourseCard from "../components/CourseCard";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { getCategoryLabel } from "../utils/courseUtils";
import { getGradientForCourse } from "../utils/courseUtils";

const HomePage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "login" });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
            email: data.email,
            fullName: data.fullName || data.email,
            id: data.id,
            role: data.role,
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8080/course");
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Ошибка загрузки курсов")
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const features = [
    { icon: "📚", title: "Разнообразные курсы", description: "Курсы по программированию, дизайну, маркетингу и другим направлениям" },
    { icon: "👨‍🏫", title: "Опытные преподаватели", description: "Практикующие специалисты с реальным опытом" },
    { icon: "✅", title: "Оценка прогресса", description: "Обратная связь и комментарии от преподавателей" },
    { icon: "🎯", title: "Гибкое расписание", description: "Учитесь в удобном темпе без строгого графика" },
    { icon: "📊", title: "Отслеживание статистики", description: "Прогресс и достижения в личном кабинете" },
    { icon: "🏆", title: "Сертификаты", description: "Подтверждение знаний после прохождения курса" },
  ];

  return (
    <>
      <Header
        user={user}
        authLoading={authLoading}
        onLogin={() => setModalState({ open: true, mode: "login" })}
        onRegister={() => setModalState({ open: true, mode: "register" })}
        onToggleMenu={() => console.log("Мобильное меню")}
      />

      <HeroSection onRegister={() => setModalState({ open: true, mode: "register" })} />

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Возможности</span>
            <h2 className="section-title">Всё для успешного обучения</h2>
            <p className="section-subtitle">
              Современная платформа с полным набором инструментов
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-gray">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Курсы</span>
            <h2 className="section-title">Популярные курсы</h2>
            <p className="section-subtitle">
              Начните обучение с самых востребованных направлений
            </p>
          </div>

          {loading ? (
            <p>Загрузка курсов...</p>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  category={getCategoryLabel(course.course_type)}
                  gradient={getGradientForCourse(course.id)}
                  title={course.title}
                  description={course.description}
                  instructor={course.full_name}
                  duration={`${course.duration_weeks} недель`}
                  onEnroll={() => () => 0}
                />
              ))}
            </div>
          )}

          <div className="section-cta">
            <a href="/courses" className="btn btn-secondary btn-lg">
              Посмотреть все курсы
            </a>
          </div>
        </div>
      </section>

      <CTASection 
        onRegister={() => setModalState({ open: true, mode: "register" })} 
        user={user}
      />

      <Footer />

      <AuthModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, mode: "login" })}
        mode={modalState.mode}
        onToggleMode={() =>
          setModalState({
            open: true,
            mode: modalState.mode === "login" ? "register" : "login"
          })
        }
        onSuccess={(userData) => setUser(userData)}
      />
    </>
  );
};

export default HomePage;
