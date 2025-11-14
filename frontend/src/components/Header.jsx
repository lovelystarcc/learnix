const Header = ({ user, authLoading, onLogin, onRegister, onToggleMenu }) => {
  const getInitial = (nameOrEmail) => {
    if (!nameOrEmail) return "?";
    return nameOrEmail.charAt(0).toUpperCase();
  };

  return (
    <header>
      <nav className="container">
        <div className="logo">
          <span className="logo-text">Learnix</span>
        </div>

        <ul className="nav-menu">
          <li><a href="/index" className="active">Главная</a></li>
          <li><a href="/courses">Курсы</a></li>
          <li><a href="/teachers">Преподаватели</a></li>
          <li><a href="/my-courses">Мои курсы</a></li>
        </ul>

        <div className="nav-actions">
          {authLoading ? null : user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {getInitial(user.fullName)}
              </div>
              <span className="user-name">{user.fullName}</span>
            </div>
          ) : (
            <>
              <button className="btn btn-outline-white" onClick={onLogin}>
                Вход
              </button>
              <button className="btn btn-white" onClick={onRegister}>
                Регистрация
              </button>
            </>
          )}
        </div>

        <div className="menu-toggle" onClick={onToggleMenu}>☰</div>
        <div className="mobile-menu" id="mobileMenu">
          <ul>
            <li><a href="/index" className="active">Главная</a></li>
            <li><a href="/courses">Курсы</a></li>
            <li><a href="/teachers">Преподаватели</a></li>
            <li><a href="/my-courses">Мои курсы</a></li>
          </ul>
          <div className="mobile-actions">
            {authLoading ? null : user ? (
              <div className="user-menu">
                <div className="user-avatar">
                  {getInitial(user.fullName)}
                </div>
                <span className="user-name">{user.fullName}</span>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-white btn-block" onClick={onLogin}>
                  Вход
                </button>
                <button className="btn btn-white btn-block" onClick={onRegister}>
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
