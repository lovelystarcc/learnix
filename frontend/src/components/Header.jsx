import { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = ({ user, authLoading, onLogin, onRegister, onLogout, onToggleMenu }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitial = (nameOrEmail) => {
    if (!nameOrEmail) return "?";
    return nameOrEmail.charAt(0).toUpperCase();
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onToggleMenu?.();
  };

  const baseNavItems = [
    { to: "/", label: "Главная", end: true },
    { to: "/courses", label: "Курсы" },
    { to: "/teachers", label: "Преподаватели" },
    { to: "/my-courses", label: "Мои курсы" },
  ];

  const navItems = user?.role === "teacher"
    ? [...baseNavItems, { to: "/teacher-courses", label: "Управление" }]
    : baseNavItems;

  return (
    <header>
      <nav className="container">
        <div className="logo">
          <span className="logo-text">Learnix</span>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          {authLoading ? null : user ? (
            <div className="user-menu">
              <div className="user-avatar">{getInitial(user.fullName)}</div>
              <span className="user-name">{user.fullName}</span>
              <button 
                className="btn btn-outline-white btn-sm" 
                onClick={onLogout}
                style={{ marginLeft: '0.5rem' }}
              >
                Выйти
              </button>
            </div>
          ) : (
            <>
              <button className="btn btn-outline-white" onClick={onLogin}>Вход</button>
              <button className="btn btn-white" onClick={onRegister}>Регистрация</button>
            </>
          )}
        </div>

        <div className="menu-toggle" onClick={handleToggleMenu}>☰</div>
        <div className={`mobile-menu ${isMenuOpen ? "show" : ""}`} id="mobileMenu">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mobile-actions">
            {authLoading ? null : user ? (
              <div className="user-menu">
                <div className="user-avatar">{getInitial(user.fullName)}</div>
                <span className="user-name">{user.fullName}</span>
                <button 
                  className="btn btn-outline-white btn-block" 
                  onClick={() => { setIsMenuOpen(false); onLogout?.(); }}
                  style={{ marginTop: '0.5rem' }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-white btn-block" onClick={() => { setIsMenuOpen(false); onLogin(); }}>Вход</button>
                <button className="btn btn-white btn-block" onClick={() => { setIsMenuOpen(false); onRegister(); }}>Регистрация</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
