const CourseCard = ({
  category,
  gradient,
  title,
  description,
  instructor,
  duration,
  onEnroll,
  enrolling,
  enrolled,
}) => {
  return (
    <div className="course-card">
      <div
        className="course-image"
        style={{ background: gradient || "#ccc" }}
      >
        <span className="course-badge">{category || "Курс"}</span>
      </div>

      <div className="course-content">
        <h3 className="course-title">{title || "Без названия"}</h3>
        <p className="course-description">{description || "Описание отсутствует"}</p>

        <div className="course-meta">
          <div className="instructor">
            <div className="instructor-avatar-small">
              {instructor[0]}
            </div>
            <span>{instructor || "Преподаватель"}</span>
          </div>
        </div>

        <div className="course-footer">
          <div className="course-info">
            <span className="course-duration">⏱ {duration ?? "—"}</span>
          </div>
          {enrolled ? (
            <button className="btn btn-secondary" disabled>
              ✓ Вы записаны
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onEnroll}
              disabled={enrolling}
            >
              {enrolling ? "Записываем..." : "Записаться"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
