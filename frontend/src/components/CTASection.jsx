const CTASection = ({ onRegister }) => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>Готовы начать своё обучение?</h2>
          <p>
            Присоединяйтесь к тысячам студентов, которые уже развивают свои
            навыки в Learnix
          </p>
          <button
            className="btn btn-white btn-lg"
            onClick={onRegister}
          >
            Зарегистрироваться бесплатно
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
