import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../api/course";
import { getLessonsByCourse } from "../api/lesson";
import { createEnrollment, getEnrollmentsByStudent, updateEnrollmentProgress } from "../api/enrollment";
import { getCategoryLabel, getGradientForCourse } from "../utils/courseUtils";

const CoursePage = ({ user, onRequireAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLesson, setActiveLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [completing, setCompleting] = useState(false);
  const toastTimer = useRef(null);

  // Calculate progress based on completed lessons
  const calculateProgress = (completedSet, totalLessons) => {
    if (totalLessons === 0) return 0;
    return Math.round((completedSet.size / totalLessons) * 100);
  };

  // Handle lesson completion
  const handleCompleteLesson = async (lessonId) => {
    if (!enrollment || completing) return;
    
    const newCompletedIds = new Set(completedLessonIds);
    
    if (newCompletedIds.has(lessonId)) {
      // Already completed, do nothing
      return;
    }
    
    newCompletedIds.add(lessonId);
    setCompleting(true);
    
    try {
      const newProgress = calculateProgress(newCompletedIds, lessons.length);
      
      // Update progress on server
      await updateEnrollmentProgress(enrollment.id, newProgress);
      
      // Update local state
      setCompletedLessonIds(newCompletedIds);
      setEnrollment({ ...enrollment, progress_percent: newProgress });
      
      // Save to localStorage for persistence
      const storageKey = `completed_lessons_${user.id}_${id}`;
      localStorage.setItem(storageKey, JSON.stringify([...newCompletedIds]));
      
      showToast(`Урок "${activeLesson.title}" отмечен как выполненный!`);
    } catch (err) {
      console.error("Ошибка обновления прогресса:", err);
      showToast(err.message || "Не удалось обновить прогресс");
    } finally {
      setCompleting(false);
    }
  };

  const showToast = (text) => {
    setToastMessage(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(id),
          getLessonsByCourse(id),
        ]);
        setCourse(courseData);
        setLessons(lessonsData || []);
        if (lessonsData && lessonsData.length > 0) {
          setActiveLesson(lessonsData[0]);
        }
      } catch (err) {
        console.error("Ошибка загрузки курса:", err);
        setError(err.message || "Не удалось загрузить курс");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!user) {
        setEnrollment(null);
        return;
      }
      try {
        const enrollments = await getEnrollmentsByStudent(user.id);
        const found = (enrollments || []).find(
          (e) => Number(e.course_id) === Number(id)
        );
        setEnrollment(found || null);
        
        // Load completed lessons from localStorage
        if (found) {
          const storageKey = `completed_lessons_${user.id}_${id}`;
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            setCompletedLessonIds(new Set(JSON.parse(saved)));
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки записи:", err);
      }
    };

    fetchEnrollment();
  }, [user, id]);

  const handleEnroll = async () => {
    if (!user) {
      onRequireAuth?.();
      showToast("Войдите, чтобы записаться на курс");
      return;
    }

    if (enrolling) return;

    try {
      setEnrolling(true);
      const newEnrollment = await createEnrollment(Number(id), user.id);
      setEnrollment(newEnrollment);
      showToast(`Вы записались на курс «${course.title}»`);
    } catch (err) {
      showToast(err.message || "Не удалось записаться на курс");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <section className="page-header">
        <div className="container">
          <p>Загрузка курса...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Ошибка</h1>
          <p className="page-subtitle">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/courses")}>
            Вернуться к курсам
          </button>
        </div>
      </section>
    );
  }

  const isEnrolled = !!enrollment;
  const canViewContent = isEnrolled || user?.role === "teacher";
  const progress = enrollment?.progress_percent || 0;
  const completedLessons = Math.round((progress / 100) * lessons.length);

  return (
    <>
      <section
        className="page-header"
        style={{ background: getGradientForCourse(course.id) }}
      >
        <div className="container">
          <span className="course-badge">{getCategoryLabel(course.course_type)}</span>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-subtitle">{course.description}</p>
          <div className="course-header-meta">
            <span>👨‍🏫 {course.full_name || "Преподаватель"}</span>
            <span>⏱ {course.duration_weeks} недель</span>
            <span>📚 {lessons.length} {lessons.length === 1 ? "урок" : lessons.length < 5 ? "урока" : "уроков"}</span>
          </div>
          {!isEnrolled ? (
            <button
              className="btn btn-white btn-lg"
              onClick={handleEnroll}
              disabled={enrolling}
              style={{ marginTop: "1.5rem" }}
            >
              {enrolling ? "Записываем..." : "Записаться на курс"}
            </button>
          ) : (
            <div className="enrolled-badge">
              ✓ Вы записаны на курс
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {lessons.length === 0 ? (
            <div className="no-results">
              <h3>Уроки пока не добавлены</h3>
              <p>Преподаватель скоро добавит материалы курса</p>
            </div>
          ) : (
            <div className="course-page-layout">
              <div className="course-sidebar">
                {isEnrolled && (
                  <div className="course-progress-card">
                    <h4>📊 Ваш прогресс</h4>
                    <div className="course-progress-bar">
                      <div 
                        className="course-progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="course-progress-text">
                      <span>{completedLessons} из {lessons.length} уроков</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}
                <h3>Содержание курса</h3>
                <div className="lessons-list">
                  {lessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        className={`lesson-item ${activeLesson?.id === lesson.id ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        onClick={() => setActiveLesson(lesson)}
                      >
                        <span className="lesson-number">
                          {isCompleted ? "✓" : index + 1}
                        </span> 
                        {lesson.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lesson-content">
                {activeLesson ? (
                  <div className="lesson-content-card">
                    <h2>{activeLesson.title}</h2>
                    {canViewContent ? (
                      <>
                        <div className="lesson-text">
                          {activeLesson.content}
                        </div>
                        {isEnrolled && (
                          <div className="lesson-actions">
                            <div className="lesson-nav">
                              {lessons.findIndex(l => l.id === activeLesson.id) > 0 && (
                                <button
                                  className="btn btn-outline"
                                  onClick={() => {
                                    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                                    setActiveLesson(lessons[currentIndex - 1]);
                                  }}
                                >
                                  ← Предыдущий урок
                                </button>
                              )}
                            </div>
                            {completedLessonIds.has(activeLesson.id) ? (
                              <button className="btn btn-complete completed" disabled>
                                ✓ Выполнено
                              </button>
                            ) : (
                              <button
                                className="btn btn-complete"
                                onClick={() => handleCompleteLesson(activeLesson.id)}
                                disabled={completing}
                              >
                                {completing ? "Сохраняем..." : "Отметить как выполненный"}
                              </button>
                            )}
                            <div className="lesson-nav">
                              {lessons.findIndex(l => l.id === activeLesson.id) < lessons.length - 1 && (
                                <button
                                  className="btn btn-outline"
                                  onClick={() => {
                                    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                                    setActiveLesson(lessons[currentIndex + 1]);
                                  }}
                                >
                                  Следующий урок →
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="locked-content">
                        <div className="lock-icon">🔒</div>
                        <h3>Контент доступен только записанным студентам</h3>
                        <p>Запишитесь на курс, чтобы получить доступ к материалам</p>
                        <button
                          className="btn btn-primary"
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                          {enrolling ? "Записываем..." : "Записаться на курс"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="lesson-content-card">
                    <p>Выберите урок из списка слева</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </>
  );
};

export default CoursePage;
