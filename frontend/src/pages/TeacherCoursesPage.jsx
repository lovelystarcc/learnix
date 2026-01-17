import { useState, useEffect } from "react";
import { createCourse, getCoursesByTeacher } from "../api/course";
import { getLessonsByCourse, createLesson, updateLesson, deleteLesson } from "../api/lesson";
import { getGradientForCourse, getCategoryLabel } from "../utils/courseUtils";

const TeacherCoursesPage = ({ user }) => {
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
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", content: "" });
  const [lessonFormLoading, setLessonFormLoading] = useState(false);
  const [lessonFormError, setLessonFormError] = useState("");
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || user.role !== "teacher") {
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

    fetchCourses();
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
      await createCourse(
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

  // Open edit modal and load lessons
  const handleEditCourse = async (course) => {
    setEditingCourse(course);
    setEditModalOpen(true);
    setLessonsLoading(true);
    setShowAddLesson(false);
    setLessonForm({ title: "", content: "" });
    setEditingLesson(null);
    setLessonFormError("");
    
    try {
      const lessons = await getLessonsByCourse(course.id);
      setCourseLessons(lessons || []);
    } catch (err) {
      console.error("Ошибка загрузки уроков:", err);
      setCourseLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingCourse(null);
    setCourseLessons([]);
    setShowAddLesson(false);
    setEditingLesson(null);
    setLessonFormError("");
  };

  const handleLessonFormChange = (e) => {
    const { name, value } = e.target;
    setLessonForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      setLessonFormError("Введите название урока");
      return;
    }
    
    setLessonFormLoading(true);
    setLessonFormError("");
    
    try {
      const orderNum = courseLessons.length + 1;
      await createLesson(editingCourse.id, lessonForm.title, lessonForm.content, orderNum);
      
      // Reload lessons
      const lessons = await getLessonsByCourse(editingCourse.id);
      setCourseLessons(lessons || []);
      
      setLessonForm({ title: "", content: "" });
      setShowAddLesson(false);
    } catch (err) {
      console.error("Ошибка создания урока:", err);
      setLessonFormError(err.message || "Не удалось создать урок");
    } finally {
      setLessonFormLoading(false);
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      setLessonFormError("Введите название урока");
      return;
    }
    
    setLessonFormLoading(true);
    setLessonFormError("");
    
    try {
      await updateLesson(
        editingLesson.id, 
        lessonForm.title, 
        lessonForm.content, 
        editingLesson.order_num,
        editingCourse.id
      );
      
      // Reload lessons
      const lessons = await getLessonsByCourse(editingCourse.id);
      setCourseLessons(lessons || []);
      
      setLessonForm({ title: "", content: "" });
      setEditingLesson(null);
      setShowAddLesson(false);
    } catch (err) {
      console.error("Ошибка обновления урока:", err);
      setLessonFormError(err.message || "Не удалось обновить урок");
    } finally {
      setLessonFormLoading(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({ title: lesson.title, content: lesson.content || "" });
    setShowAddLesson(true);
    setLessonFormError("");
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот урок?")) {
      return;
    }
    
    try {
      await deleteLesson(lessonId);
      
      // Reload lessons
      const lessons = await getLessonsByCourse(editingCourse.id);
      setCourseLessons(lessons || []);
    } catch (err) {
      console.error("Ошибка удаления урока:", err);
      alert(err.message || "Не удалось удалить урок");
    }
  };

  const handleCancelLessonEdit = () => {
    setShowAddLesson(false);
    setEditingLesson(null);
    setLessonForm({ title: "", content: "" });
    setLessonFormError("");
  };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Мои курсы</h1>
          <p className="page-subtitle">
            Создавайте и управляйте своими курсами
          </p>
        </div>
      </section>

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
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div
                    className="course-image"
                    style={{ background: getGradientForCourse(course.id) }}
                  >
                    <span className="course-badge">{getCategoryLabel(course.course_type)}</span>
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <div className="instructor">
                        <div className="instructor-avatar-small">
                          {course.full_name?.[0] || "П"}
                        </div>
                        <span>{course.full_name || "Преподаватель"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="course-footer">
                    <div className="course-info">
                      <span className="course-duration">⏱ {course.duration_weeks} нед.</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditCourse(course)}
                    >
                      ✏️ Редактировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Edit Course Modal */}
      {editModalOpen && editingCourse && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-overlay"></div>
          <div className="modal-content edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📚 {editingCourse.title}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <h3 style={{ marginBottom: "1rem" }}>Уроки курса</h3>
              
              {lessonsLoading ? (
                <p>Загрузка уроков...</p>
              ) : courseLessons.length === 0 ? (
                <div className="no-results" style={{ padding: "1rem", marginBottom: "1rem" }}>
                  <p>Уроки пока не добавлены</p>
                </div>
              ) : (
                <div className="lessons-edit-list">
                  {courseLessons.map((lesson, index) => (
                    <div key={lesson.id} className="lesson-edit-item">
                      <span className="lesson-number">{index + 1}</span>
                      <div className="lesson-info">
                        <div className="lesson-title">{lesson.title}</div>
                      </div>
                      <div className="lesson-edit-actions">
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => handleEditLesson(lesson)}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          title="Удалить"
                          style={{ color: "#ef4444" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showAddLesson ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowAddLesson(true);
                    setEditingLesson(null);
                    setLessonForm({ title: "", content: "" });
                  }}
                  style={{ marginTop: "1rem" }}
                >
                  ➕ Добавить урок
                </button>
              ) : (
                <div className="add-lesson-form">
                  <h4 style={{ marginBottom: "1rem" }}>
                    {editingLesson ? "Редактировать урок" : "Новый урок"}
                  </h4>
                  
                  {lessonFormError && (
                    <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                      {lessonFormError}
                    </div>
                  )}
                  
                  <form onSubmit={editingLesson ? handleUpdateLesson : handleAddLesson}>
                    <div className="form-group">
                      <label htmlFor="lessonTitle">Название урока *</label>
                      <input
                        type="text"
                        id="lessonTitle"
                        name="title"
                        placeholder="Например: Введение в тему"
                        value={lessonForm.title}
                        onChange={handleLessonFormChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lessonContent">Содержание урока</label>
                      <textarea
                        id="lessonContent"
                        name="content"
                        placeholder="Текст урока..."
                        value={lessonForm.content}
                        onChange={handleLessonFormChange}
                        rows="6"
                      />
                    </div>
                    
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={lessonFormLoading}
                      >
                        {lessonFormLoading 
                          ? "Сохраняем..." 
                          : editingLesson 
                            ? "Сохранить изменения" 
                            : "Добавить урок"
                        }
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleCancelLessonEdit}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherCoursesPage;
