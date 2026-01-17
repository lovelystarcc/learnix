import { Link } from "react-router-dom";

const CourseCard = ({
  id,
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
      <Link to={id ? `/course/${id}` : "#"} style={{ textDecoration: "none", color: "inherit" }}>
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
                {instructor?.[0] || "П"}
              </div>
              <span>{instructor || "Преподаватель"}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="course-footer">
        <div className="course-info">
          <span className="course-duration">⏱ {duration ?? "—"}</span>
        </div>
        {enrolled ? (
          <Link to={id ? `/course/${id}` : "#"} className="btn btn-secondary">
            Перейти к курсу
          </Link>
        ) : (
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              onEnroll?.();
            }}
            disabled={enrolling}
          >
            {enrolling ? "Записываем..." : "Записаться"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
