import { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import FeatureCard from "../components/FeatureCard";
import CourseCard from "../components/CourseCard";
import CTASection from "../components/CTASection";
import { getCategoryLabel, getGradientForCourse } from "../utils/courseUtils";
import { getCourses } from "../api/course";

const HomePage = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <HeroSection onRegister={() => console.log("Открыть регистрацию")} />

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
                  onEnroll={() => console.log("Записаться")}
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
        onRegister={() => console.log("Открыть регистрацию")} 
        user={user}
      />
    </>
  );
};

export default HomePage;
