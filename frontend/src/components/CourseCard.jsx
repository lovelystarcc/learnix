const CourseCard = ({
  category,
  gradient,
  title,
  description,
  instructor,
  instructorAvatar,
  students,
  rating,
  duration,
  level,
  onEnroll,
}) => {
  return (
    <div className="course-card">
      <div
        className="course-image"
        style={{ background: gradient }}
      >
        <span className="course-badge">{category}</span>
      </div>

      <div className="course-content">
        <h3 className="course-title">{title}</h3>
        <p className="course-description">{description}</p>

        <div className="course-meta">
          <div className="instructor">
            <div className="instructor-avatar">{instructorAvatar}</div>
            <span>{instructor}</span>
          </div>
          <div className="course-stats">
            <span>👥 {students}</span>
            <span>⭐ {rating}</span>
          </div>
        </div>

        <div className="course-footer">
          <div className="course-info">
            <span className="course-duration">⏱ {duration}</span>
            <span className={`course-level level-${level.toLowerCase()}`}>
              {level}
            </span>
          </div>
          <button
            className="btn btn-primary"
            onClick={onEnroll}
          >
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
