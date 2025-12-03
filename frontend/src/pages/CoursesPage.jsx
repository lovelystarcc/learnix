import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import AuthModal from "../components/AuthModal";
import { getCategoryLabel } from "../utils/courseUtils";
import { getGradientForCourse } from "../utils/courseUtils";

const CoursesPage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "login" });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "Все" },
    { id: "programming", label: "Программирование" },
    { id: "design", label: "Дизайн" },
    { id: "marketing", label: "Маркетинг" },
    { id: "business", label: "Бизнес" },
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
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8080/course");
        if (!response.ok) throw new Error("Ошибка загрузки курсов");
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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.course_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="page-title">Каталог курсов</h1>
          <p className="page-subtitle">
            Выберите курс и начните свой путь к новым знаниям
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <div className="search-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="8.5" cy="8.5" r="5.5" strokeWidth="2" />
                <path d="M12 12l5 5" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Поиск курсов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`filter-btn ${
                    selectedCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <p>Загрузка курсов...</p>
          ) : filteredCourses.length === 0 ? (
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
              <h3>Курсы не найдены</h3>
              <p>Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
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

export default CoursesPage;

