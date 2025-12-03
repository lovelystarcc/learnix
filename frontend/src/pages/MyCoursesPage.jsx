import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StatCard from "../components/StatCard";
import MyCourseCard from "../components/MyCourseCard";
import AuthModal from "../components/AuthModal";

const MyCoursesPage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "login" });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #5f72bd 0%, #9921e8 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
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
            email: data.email,
            fullName: data.full_name || data.fullName || data.email,
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
    // TODO: Когда будет API для enrollments, загружать курсы пользователя
    // Пока загружаем все курсы как пример
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8080/course");
        if (!response.ok) throw new Error("Ошибка загрузки курсов");
        const data = await response.json();
        // Для демонстрации берем первые 3 курса как активные
        setCourses(data.slice(0, 3));
      } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Моковые данные для демонстрации
  const nextLessons = [
    "Урок 8: Работа с API",
    "Урок 5: Прототипирование",
    "Урок 3: Циклы и условия",
  ];
  const activeCourses = courses.map((course, index) => ({
    ...course,
    progress: [65, 40, 20][index] || 0,
    nextLesson: nextLessons[index] || "Следующий урок",
    weeksLeft: [4, 5, 7][index] || 0,
    instructor: "Преподаватель",
    instructorAvatar: "П",
    gradient: gradients[index % gradients.length],
  }));

  const completedCourses = [
    {
      id: 1,
      title: "SMM и продвижение",
      grade: "4.8",
      feedback:
        "Отличная работа! Показал глубокое понимание материала и креативный подход к заданиям. Все проекты выполнены на высоком уровне.",
      feedbackInstructor: "Ксения Новикова",
      feedbackInstructorAvatar: "К",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      id: 2,
      title: "Финансовая грамотность",
      grade: "4.6",
      feedback:
        "Студент проявил большой интерес к материалу. Все задания выполнены качественно и в срок. Рекомендую продолжить обучение!",
      feedbackInstructor: "Татьяна Смирнова",
      feedbackInstructorAvatar: "Т",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
  ];

  const stats = {
    active: activeCourses.length,
    completed: completedCourses.length,
    hoursPerWeek: 12,
    averageGrade: "4.7",
  };

  const handleContinueCourse = (courseTitle) => {
    console.log("Продолжить обучение:", courseTitle);
    // TODO: Реализовать переход к курсу
  };

  if (!user && !authLoading) {
    return (
      <>
        <Header
          user={user}
          authLoading={authLoading}
          onLogin={() => setModalState({ open: true, mode: "login" })}
          onRegister={() => setModalState({ open: true, mode: "register" })}
          onToggleMenu={() => console.log("Мобильное меню")}
        />
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Мои курсы</h1>
            <p className="page-subtitle">
              Войдите в систему, чтобы увидеть свои курсы
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="no-results">
              <h3>Требуется авторизация</h3>
              <p>Пожалуйста, войдите в систему, чтобы просмотреть свои курсы</p>
              <button
                style={{ marginTop: "20px" }}
                className="btn btn-primary"
                onClick={() => setModalState({ open: true, mode: "login" })}
              >
                Войти
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
          onSuccess={(userData) => setUser(userData)}
        />
      </>
    );
  }

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
          <h1 className="page-title">Мои курсы</h1>
          <p className="page-subtitle">
            Отслеживайте свой прогресс и продолжайте обучение
          </p>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="section">
        <div className="container">
          <div className="dashboard-stats">
            <StatCard
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17l10 5 10-5M2 12l10 5 10-5"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              value={stats.active}
              label="Активных курса"
              iconBg="rgba(99, 102, 241, 0.1)"
              iconColor="#6366f1"
            />
            <StatCard
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                  />
                </svg>
              }
              value={stats.completed}
              label="Завершено"
              iconBg="rgba(16, 185, 129, 0.1)"
              iconColor="#10b981"
            />
            <StatCard
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              value={stats.hoursPerWeek}
              label="Часов в неделю"
              iconBg="rgba(245, 158, 11, 0.1)"
              iconColor="#f59e0b"
            />
            <StatCard
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    strokeWidth="2"
                  />
                </svg>
              }
              value={stats.averageGrade}
              label="Средний балл"
              iconBg="rgba(139, 92, 246, 0.1)"
              iconColor="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* My Courses */}
      <section className="section">
        <div className="container">
          <div className="section-tabs">
            <button
              className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Активные
            </button>
            <button
              className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Завершенные
            </button>
          </div>

          {loading ? (
            <p>Загрузка курсов...</p>
          ) : activeTab === "active" ? (
            activeCourses.length === 0 ? (
              <div className="no-results">
                <h3>Нет активных курсов</h3>
 
                <p className="section-subtitle">Запишитесь на курс, чтобы начать обучение</p>

                <a href="/courses"
                 style={{ marginTop: "20px" }}
                 className="btn btn-primary">Посмотреть курсы</a>
              </div>
            ) : (
              <div className="my-courses-grid">
                {activeCourses.map((course) => (
                  <MyCourseCard
                    key={course.id}
                    title={course.title}
                    status="В процессе"
                    progress={course.progress}
                    instructor={course.instructor}
                    instructorAvatar={course.instructorAvatar}
                    nextLesson={course.nextLesson}
                    weeksLeft={course.weeksLeft}
                    gradient={course.gradient}
                    onContinue={() => handleContinueCourse(course.title)}
                  />
                ))}
              </div>
            )
          ) : (
            completedCourses.length === 0 ? (
              <div className="no-results">
                <h3>Нет завершенных курсов</h3>
                <p>Завершите курс, чтобы увидеть его здесь</p>
              </div>
            ) : (
              <div className="my-courses-grid">
                {completedCourses.map((course) => (
                  <MyCourseCard
                    key={course.id}
                    title={course.title}
                    gradient={course.gradient}
                    isCompleted={true}
                    grade={course.grade}
                    feedback={course.feedback}
                    feedbackInstructor={course.feedbackInstructor}
                    feedbackInstructorAvatar={course.feedbackInstructorAvatar}
                  />
                ))}
              </div>
            )
          )}
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
        onSuccess={(userData) => setUser(userData)}
      />
    </>
  );
};

export default MyCoursesPage;

