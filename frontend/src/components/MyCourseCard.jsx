const MyCourseCard = ({
  title,
  status,
  progress,
  instructor,
  instructorAvatar,
  nextLesson,
  weeksLeft,
  gradient,
  onContinue,
  isCompleted = false,
  grade,
  feedback,
  feedbackInstructor,
  feedbackInstructorAvatar,
}) => {
  if (isCompleted) {
    return (
      <div className="my-course-card">
        <div
          className="my-course-header"
          style={{ background: gradient }}
        >
          <h3>{title}</h3>
          <span className="course-status status-completed">Завершен</span>
        </div>
        <div className="my-course-body">
          <div className="completed-badge">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#10b981" opacity="0.1" />
              <path
                d="M16 24l6 6 12-12"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h4>Курс успешно завершен!</h4>
          </div>
          {grade && (
            <div className="course-grade">
              <div className="grade-box">
                <span className="grade-label">Итоговая оценка</span>
                <span className="grade-value">{grade}</span>
              </div>
              <div className="grade-stars">⭐⭐⭐⭐⭐</div>
            </div>
          )}
          {feedback && (
            <div className="teacher-feedback">
              <h4>Отзыв преподавателя</h4>
              <div className="feedback-content">
                {feedbackInstructor && (
                  <div className="instructor-mini">
                    <div className="instructor-avatar-small">
                      {feedbackInstructorAvatar || "П"}
                    </div>
                    <span>{feedbackInstructor}</span>
                  </div>
                )}
                <p>{feedback}</p>
              </div>
            </div>
          )}
          <div className="course-actions">
            <button className="btn btn-secondary btn-block">
              Скачать сертификат
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-course-card">
      <div
        className="my-course-header"
        style={{ background: gradient }}
      >
        <h3>{title}</h3>
        <span className="course-status status-in-progress">{status || "В процессе"}</span>
      </div>
      <div className="my-course-body">
        <div className="progress-section">
          <div className="progress-info">
            <span>Прогресс курса</span>
            <strong>{progress || 0}%</strong>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
        </div>
        <div className="course-details">
          {instructor && (
            <div className="detail-item">
              <span className="detail-label">Преподаватель</span>
              <div className="instructor-mini">
                <div className="instructor-avatar-small">
                  {instructorAvatar || "П"}
                </div>
                <span>{instructor}</span>
              </div>
            </div>
          )}
          {nextLesson && (
            <div className="detail-item">
              <span className="detail-label">Следующий урок</span>
              <span className="detail-value">{nextLesson}</span>
            </div>
          )}
          {weeksLeft !== undefined && (
            <div className="detail-item">
              <span className="detail-label">До завершения</span>
              <span className="detail-value">{weeksLeft} {weeksLeft === 1 ? "неделя" : weeksLeft < 5 ? "недели" : "недель"}</span>
            </div>
          )}
        </div>
        <div className="course-actions">
          <button
            className="btn btn-primary btn-block"
            onClick={onContinue}
          >
            Продолжить обучение
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCourseCard;

