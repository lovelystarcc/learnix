import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import MyCourseCard from "../components/MyCourseCard";
import { getEnrollmentsByStudent } from "../api/enrollment";
import { getCourses } from "../api/course";

const MyCoursesPage = ({ user, onRequireAuth }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #5f72bd 0%, #9921e8 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ];

  const showToast = (text) => {
    setToastMessage(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const [enrollmentsData, coursesData] = await Promise.all([
          getEnrollmentsByStudent(user.id),
          getCourses(),
        ]);

        const coursesMap = new Map();
        (coursesData || []).forEach((c) => {
          coursesMap.set(c.id, c);
        });

        const merged = (enrollmentsData || []).map((enr) => ({
          ...enr,
          course: coursesMap.get(enr.course_id) || null,
        }));

        setEnrollments(merged);
      } catch (error) {
        console.error("Ошибка загрузки записей:", error);
        showToast(error.message || "Не удалось загрузить записи");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const allCourses = enrollments
    .filter((enrollment) => enrollment && enrollment.course)
    .map((enrollment, index) => {
      const course = enrollment.course;
      const title = course?.title || "Без названия";
      const instructor = course?.full_name || "Преподаватель";
      const progress = enrollment.progress_percent ?? 0;

      return {
        id: course?.id ?? index,
        title,
        instructor,
        instructorAvatar: instructor?.[0] || "П",
        progress,
        isCompleted: progress >= 100,
        nextLesson: undefined,
        weeksLeft: course?.duration_weeks,
        gradient: gradients[index % gradients.length],
      };
    });

  const activeCourses = allCourses.filter((course) => !course.isCompleted);
  const completedCourses = allCourses.filter((course) => course.isCompleted);

  const stats = [
    { label: "Активных курсов", value: activeCourses.length },
    { label: "Завершено", value: completedCourses.length },
  ];

  const handleContinueCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (!user) {
    return (
      <>
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Мои курсы</h1>
            <p className="page-subtitle">Отслеживайте свой прогресс и продолжайте обучение</p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="auth-prompt-card">
              <div className="auth-prompt-icon">📚</div>
              <h3>Войдите, чтобы увидеть свои курсы</h3>
              <p>После авторизации вы сможете отслеживать прогресс обучения, продолжать курсы с того места, где остановились, и получать персональные рекомендации.</p>
              <div className="auth-prompt-buttons">
                <button className="btn btn-primary btn-lg" onClick={() => onRequireAuth?.()}>
                  Войти в аккаунт
                </button>
                <a href="/courses" className="btn btn-outline btn-lg">
                  Посмотреть курсы
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Мои курсы</h1>
          <p className="page-subtitle">Отслеживайте свой прогресс и продолжайте обучение</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="dashboard-stats">
            {stats.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {toastMessage && <div className="toast">{toastMessage}</div>}

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
                <p>Запишитесь на курс, чтобы начать обучение</p>
                <a href="/courses" className="btn btn-primary">Посмотреть курсы</a>
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
                    onContinue={() => handleContinueCourse(course.id)}
                  />
                ))}
              </div>
            )
          ) : completedCourses.length === 0 ? (
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
                  status="Завершён"
                  progress={course.progress}
                  instructor={course.instructor}
                  instructorAvatar={course.instructorAvatar}
                  weeksLeft={course.weeksLeft}
                  gradient={course.gradient}
                  onContinue={() => handleContinueCourse(course.id)}
                  isCompleted={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MyCoursesPage;
