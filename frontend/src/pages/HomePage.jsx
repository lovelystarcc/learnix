import { useState, useEffect, useRef } from "react";
import HeroSection from "../components/HeroSection";
import FeatureCard from "../components/FeatureCard";
import CourseCard from "../components/CourseCard";
import CTASection from "../components/CTASection";
import { getCategoryLabel, getGradientForCourse } from "../utils/courseUtils";
import { getCourses } from "../api/course";
import { createEnrollment, getEnrollmentsByStudent } from "../api/enrollment";

const HomePage = ({ user, onRequireAuth }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);
  const [topCategories, setTopCategories] = useState([]);
  const [heroStats, setHeroStats] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);

        const counts = data.reduce((acc, c) => {
          if (!c?.course_type) return acc;
          acc[c.course_type] = (acc[c.course_type] || 0) + 1;
          return acc;
        }, {});

        const sortedCats = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type, count]) => ({
            type,
            title: getCategoryLabel(type),
            count,
          }));

        setTopCategories(sortedCats);
        setHeroStats([
          { label: "курсов", value: data.length || "—" },
          { label: "категорий", value: Object.keys(counts).length || "—" },
        ]);
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
      <HeroSection
        onRegister={onRequireAuth}
        stats={heroStats}
        categories={topCategories}
      />

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
                  onEnroll={() => handleEnroll(course.id, course.title)}
                  enrolling={enrollingId === course.id}
                  enrolled={isEnrolled(course.id)}
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

      {toastMessage && <div className="toast">{toastMessage}</div>}

      <CTASection 
        onRegister={() => console.log("Открыть регистрацию")} 
        user={user}
      />
    </>
  );
};

export default HomePage;
