import { useState, useEffect } from "react";
import TeacherCard from "../components/TeacherCard";
import TeacherApplicationModal from "../components/TeacherApplicationModal";
import { getTeachers } from "../api/teacher";

const TeachersPage = ({ user }) => {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(false);
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

  const fetchData = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Ошибка загрузки преподавателей:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTeacherName = (teacher) => teacher.full_name;

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Наши преподаватели</h1>
          <p className="page-subtitle">
            Опытные специалисты с реальным опытом работы в индустрии
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p>Загрузка преподавателей...</p>
          ) : teachers.length === 0 ? (
            <div className="no-results">
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

      {user?.role === "student" && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Хотите стать преподавателем?</h2>
              <p>
                Поделитесь своими знаниями с тысячами студентов и зарабатывайте на обучении
              </p>
              <button
                className="btn btn-white btn-lg"
                onClick={() => {
                  if (!user) {
                    setPendingApplication(true);
                    pendingApplication(true)
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
      )}

      <TeacherApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        user={user}
        onSuccess={() => {
          fetchData();
          setApplicationModalOpen(false);
        }}
      />
    </>
  );
};

export default TeachersPage;
