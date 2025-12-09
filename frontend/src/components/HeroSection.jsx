const iconsByType = {
  programming: "💻",
  design: "🎨",
  marketing: "📈",
  business: "💼",
};

const HeroSection = ({ onRegister, stats = [], categories = [] }) => {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="container hero-content">
        <div className="hero-text">
          <span className="hero-badge">🎓 Образовательная платформа</span>
          <h1 className="hero-title">Добро пожаловать в Learnix</h1>
          <p className="hero-description">
            Откройте для себя мир новых знаний и развивайте свои навыки вместе с
            опытными преподавателями. Более 150 курсов, гибкое расписание и
            персональная обратная связь.
          </p>

          <div className="hero-buttons">
            <button
              className="btn btn-primary btn-lg"
              onClick={onRegister}
            >
              <span>Начать обучение</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <a href="/courses" className="btn btn-secondary btn-lg">
              Просмотреть курсы
            </a>
          </div>

          {stats?.length > 0 && (
            <div className="hero-stats">
              {stats.map((item, idx) => (
                <div className="stat-item" key={idx}>
                  <strong>{item.value ?? "—"}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hero-image">
          {categories?.map((cat, idx) => (
            <div className={`floating-card card-${idx + 1}`} key={cat.type ?? idx}>
              <div className="card-icon">{cat.icon || iconsByType[cat.type] || "📘"}</div>
              <div className="card-text">
                <strong>{cat.title || "Категория"}</strong>
                <span>
                  {cat.count
                    ? `${cat.count} курс${cat.count === 1 ? "" : cat.count < 5 ? "а" : "ов"}`
                    : "Нет курсов"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
