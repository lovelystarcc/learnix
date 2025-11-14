const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-text">Learnix</span>
            </div>
            <p>
              Современная образовательная платформа для развития
              профессиональных навыков
            </p>
          </div>

          <div className="footer-section">
            <h4>Платформа</h4>
            <ul>
              <li><a href="/courses">Все курсы</a></li>
              <li><a href="/teachers">Преподаватели</a></li>
              <li><a href="/about">О нас</a></li>
              <li><a href="/blog">Блог</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Поддержка</h4>
            <ul>
              <li><a href="/help">Справка</a></li>
              <li><a href="/contacts">Контакты</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/reviews">Отзывы</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Юридическое</h4>
            <ul>
              <li><a href="/terms">Условия использования</a></li>
              <li><a href="/privacy">Политика конфиденциальности</a></li>
              <li><a href="/license">Лицензия</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Learnix. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
