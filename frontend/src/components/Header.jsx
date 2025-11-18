import { useState, useEffect } from "react";

const Header = ({ user, authLoading, onLogin, onRegister, onToggleMenu }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    const updatePath = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
    };

    updatePath();
    window.addEventListener("popstate", updatePath);

    return () => {
      window.removeEventListener("popstate", updatePath);
    };
  }, []);

  const getInitial = (nameOrEmail) => {
    if (!nameOrEmail) return "?";
    return nameOrEmail.charAt(0).toUpperCase();
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onToggleMenu) {
      onToggleMenu();
    }
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    window.history.pushState({}, "", href);
    setCurrentPath(href);
    setIsMenuOpen(false);
    // Триггерим событие для обновления App.jsx
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const isActive = (path) => {
    if (path === "/" || path === "/index" || path === "/index.html") {
      return currentPath === "/" || currentPath === "/index" || currentPath === "/index.html";
    }
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  const navItems = [
    { href: "/", label: "Главная" },
    { href: "/courses", label: "Курсы" },
    { href: "/teachers", label: "Преподаватели" },
    { href: "/my-courses", label: "Мои курсы" },
  ];

  return (
    <header>
      <nav className="container">
        <div className="logo">
          <span className="logo-text">Learnix</span>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
                onClick={(e) => handleLinkClick(e, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
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

        <div className="menu-toggle" onClick={handleToggleMenu}>☰</div>
        <div className={`mobile-menu ${isMenuOpen ? "show" : ""}`} id="mobileMenu">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={isActive(item.href) ? "active" : ""}
                  onClick={(e) => handleLinkClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
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
                <button className="btn btn-outline-white btn-block" onClick={() => {
                  setIsMenuOpen(false);
                  onLogin();
                }}>
                  Вход
                </button>
                <button className="btn btn-white btn-block" onClick={() => {
                  setIsMenuOpen(false);
                  onRegister();
                }}>
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
