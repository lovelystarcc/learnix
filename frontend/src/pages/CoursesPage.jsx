import { useState, useEffect, useRef } from "react";
import CourseCard from "../components/CourseCard";
import { getCategories, getCategoryLabel, getGradientForCourse } from "../utils/courseUtils";
import { getCourses } from "../api/course";
import { createEnrollment, getEnrollmentsByStudent } from "../api/enrollment";

const CoursesPage = ({ user, onRequireAuth }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Ошибка загрузки курсов:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!user) {
        setEnrollments([]);
        return;
      }
      try {
        const data = await getEnrollmentsByStudent(user.id);
        setEnrollments(data || []);
      } catch (err) {
        console.error("Ошибка загрузки записей:", err);
      }
    };
    loadEnrollments();
  }, [user]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.course_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const showToast = (text) => {
    setToastMessage(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 3000);
  };

  const handleEnroll = async (courseId, title) => {
    if (!user) {
      onRequireAuth?.();
      showToast("Войдите, чтобы записаться на курс");
      return;
    }

    if (enrollingId !== null) return;

    try {
      setEnrollingId(courseId);
      await createEnrollment(courseId, user.id);
      setEnrollments((prev) => [...prev, { course_id: courseId }]);
      showToast(`Вы записались на курс «${title}»`);
    } catch (err) {
      showToast(err.message || "Не удалось записаться на курс");
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (courseId) =>
    enrollments?.some((enr) => enr && Number(enr.course_id) === Number(courseId));

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Каталог курсов</h1>
          <p className="page-subtitle">
            Выберите курс и начните свой путь к новым знаниям
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
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
              {getCategories().map((category) => (
                <button
                  key={category.id}
                  className={`filter-btn ${selectedCategory === category.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p>Загрузка курсов...</p>
          ) : filteredCourses.length === 0 ? (
            <div className="no-results">
              <h3>Курсы не найдены</h3>
              <p>Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  category={getCategoryLabel(course.course_type)}
                  gradient={getGradientForCourse(course.id)}
                  title={course.title}
                  description={course.description}
                  instructor={course.full_name}
                  duration={`${course.duration_weeks} недель`}
                  onEnroll={() => handleEnroll(course.id, course.title)}
                  enrolling={enrollingId === course.id}
                  enrolled={isEnrolled(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </>
  );
};

export default CoursesPage;
