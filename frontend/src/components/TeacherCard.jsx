const TeacherCard = ({
  userID,
  name,
  specialization,
  bio,
  technologies,
  coursesCount,
  studentsCount,
  rating,
  gradient,
}) => {
  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const techList = technologies ? technologies.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="teacher-card">
      <div
        className="teacher-avatar-large"
        style={{ background: gradient }}
      >
        <span>{getInitial(name)}</span>
      </div>
      <div className="teacher-info">
        <h3>{name || "Преподаватель"}</h3>
        <p className="teacher-role">{specialization || "Преподаватель"}</p>
        <p className="teacher-description">
          {bio || "Опытный преподаватель с большим опытом работы"}
        </p>
        <div className="teacher-stats">
          <div className="stat">
            <strong>{coursesCount || 0}</strong>
            <span>{coursesCount === 1 ? "курс" : coursesCount < 5 ? "курса" : "курсов"}</span>
          </div>
          <div className="stat">
            <strong>{studentsCount || 0}</strong>
            <span>студентов</span>
          </div>
          <div className="stat">
            <strong>{rating || "4.5"}</strong>
            <span>рейтинг</span>
          </div>
        </div>
        {techList.length > 0 && (
          <div className="teacher-courses">
            {techList.map((tech, index) => (
              <span key={index} className="course-tag">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCard;

