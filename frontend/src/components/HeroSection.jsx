const HeroSection = ({ onRegister }) => {
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

          <div className="hero-stats">
            <div className="stat-item">
              <strong>5000+</strong>
              <span>студентов</span>
            </div>
            <div className="stat-item">
              <strong>150+</strong>
              <span>курсов</span>
            </div>
            <div className="stat-item">
              <strong>85+</strong>
              <span>преподавателей</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="floating-card card-1">
            <div className="card-icon">📚</div>
            <div className="card-text">
              <strong>Программирование</strong>
              <span>42 курса</span>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🎨</div>
            <div className="card-text">
              <strong>Дизайн</strong>
              <span>28 курсов</span>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">💼</div>
            <div className="card-text">
              <strong>Бизнес</strong>
              <span>35 курсов</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
