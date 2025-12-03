import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import AuthModal from "../components/AuthModal";
import { createCourse, getCoursesByTeacher } from "../api/course";
import { getGradientForCourse, getCategoryLabel } from "../utils/courseUtils";
import { fetchUser } from "../api/auth";

const TeacherCoursesPage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "login" });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseType: "programming",
    durationWeeks: 4,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetchUser(setUser, setAuthLoading);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCoursesByTeacher(user.id);
        setCourses(data);
      } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "teacher") {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "durationWeeks" ? parseInt(value) || 4 : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    setFormSuccess(false);

    if (!user || !user.id) {
      setFormError("Необходимо войти в систему");
      setFormLoading(false);
      return;
    }

    try {
      const newCourse = await createCourse(
        formData.title,
        formData.description,
        formData.courseType,
        formData.durationWeeks,
        user.id
      );

      setFormSuccess(true);
      setFormData({
        title: "",
        description: "",
        courseType: "programming",
        durationWeeks: 4,
      });

      // Обновляем список курсов
      const updatedCourses = await getCoursesByTeacher(user.id);
      setCourses(updatedCourses);

      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 2000);
    } catch (err) {
      console.error("Ошибка создания курса:", err);
      setFormError(err.message || "Не удалось создать курс");
    } finally {
      setFormLoading(false);
    }
  };

  // Проверка доступа
  if (!authLoading && (!user || user.role !== "teacher")) {
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
            <h1 className="page-title">Мои курсы (Преподаватель)</h1>
            <p className="page-subtitle">
              Эта страница доступна только для преподавателей
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="no-results">
              <h3>Доступ ограничен</h3>
              <p>
                {!user
                  ? "Войдите в систему как преподаватель, чтобы получить доступ к этой странице"
                  : "Эта страница доступна только для пользователей с ролью преподавателя"}
              </p>
              {!user && (
                <button
                  style={{ marginTop: "20px" }}
                  className="btn btn-primary"
                  onClick={() => setModalState({ open: true, mode: "login" })}
                >
                  Войти
                </button>
              )}
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
            Создавайте и управляйте своими курсами
          </p>
        </div>
      </section>

      {/* Create Course Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Создание курса</span>
            <h2 className="section-title">Добавьте свой курс</h2>
            <p className="section-subtitle">
              Начните делиться знаниями — создайте новый курс всего за пару минут
            </p>
          </div>

          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <button
              className={`btn btn-lg ${showForm ? "btn-outline" : "btn-primary"}`}
              onClick={() => {
                setShowForm(!showForm);
                setFormError("");
                setFormSuccess(false);
              }}
            >
              {showForm ? "Скрыть форму" : "➕ Создать новый курс"}
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ marginTop: "2rem", padding: "2rem" }}>
              <h2 style={{ marginBottom: "1.5rem" }}>Создать новый курс</h2>

              {formError && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                  Курс успешно создан!
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Название курса *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Например: Основы Python для начинающих"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Описание курса *</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Опишите содержание курса..."
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="courseType">Категория *</label>
                  <select
                    id="courseType"
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="programming">Программирование</option>
                    <option value="design">Дизайн</option>
                    <option value="marketing">Маркетинг</option>
                    <option value="business">Бизнес</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="durationWeeks">Длительность (недели) *</label>
                  <input
                    type="number"
                    id="durationWeeks"
                    name="durationWeeks"
                    min="1"
                    max="52"
                    value={formData.durationWeeks}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={formLoading}
                >
                  {formLoading ? "Создание..." : "Создать курс"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>


      {/* My Courses List */}
      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: "1.5rem" }}>Мои курсы</h2>

          {loading ? (
            <p>Загрузка курсов...</p>
          ) : courses.length === 0 ? (
            <div className="no-results">
              <h3>У вас пока нет курсов</h3>
              <p>Создайте свой первый курс, используя форму выше</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id || index}
                  category={getCategoryLabel(course.course_type)}
                  gradient={getGradientForCourse(course.course_type, index)}
                  title={course.title}
                  description={course.description}
                  instructor={user?.fullName || "Вы"}
                  instructorAvatar={user?.fullName?.charAt(0).toUpperCase() || "П"}
                  students="0"
                  rating="0"
                  duration={`${course.duration_weeks} недель`}
                  level="Средний"
                  onEnroll={() => {}}
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

export default TeacherCoursesPage;

