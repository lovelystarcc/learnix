import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import AuthModal from "../components/AuthModal";

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

  const categoryGradients = {
    programming: [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #5f72bd 0%, #9921e8 100%)",
      "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)",
    ],
    design: [
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ],
    marketing: [
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    ],
    business: [
      "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    ],
  };

  const getCategoryLabel = (courseType) => {
    const labels = {
      programming: "Программирование",
      design: "Дизайн",
      marketing: "Маркетинг",
      business: "Бизнес",
    };
    return labels[courseType] || courseType;
  };

  const getGradientForCourse = (courseType, index) => {
    const gradients = categoryGradients[courseType] || categoryGradients.programming;
    return gradients[index % gradients.length];
  };

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
        const response = await fetch("http://localhost:8080/courses");
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

  const handleEnroll = (course) => {
    if (!user) {
      setModalState({ open: true, mode: "login" });
      return;
    }
    console.log("Записаться на:", course.title);
    // TODO: Реализовать запись на курс
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
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id || index}
                  category={getCategoryLabel(course.course_type)}
                  gradient={getGradientForCourse(course.course_type, index)}
                  title={course.title}
                  description={course.description}
                  instructor="Преподаватель"
                  instructorAvatar="П"
                  students="0"
                  rating="0"
                  duration={`${course.duration_weeks} недель`}
                  level="Средний"
                  onEnroll={() => handleEnroll(course)}
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

