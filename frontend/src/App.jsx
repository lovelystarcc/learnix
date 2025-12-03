import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import TeachersPage from "./pages/TeachersPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname;
      if (path === "/courses" || path === "/courses.html") {
        setCurrentPage("courses");
      } else if (path === "/teachers" || path === "/teachers.html") {
        setCurrentPage("teachers");
      } else if (path === "/my-courses" || path === "/my-courses.html") {
        setCurrentPage("my-courses");
      } else if (path === "/teacher-courses" || path === "/teacher-courses.html") {
        setCurrentPage("teacher-courses");
      } else {
        setCurrentPage("home");
      }
    };

    updatePage();

    // Обработка навигации через ссылки
    const handleNavigation = (e) => {
      if (e.target.tagName === "A" && e.target.href) {
        const url = new URL(e.target.href);
        if (url.pathname === "/courses" || url.pathname === "/courses.html") {
          e.preventDefault();
          window.history.pushState({}, "", "/courses");
          setCurrentPage("courses");
        } else if (url.pathname === "/teachers" || url.pathname === "/teachers.html") {
          e.preventDefault();
          window.history.pushState({}, "", "/teachers");
          setCurrentPage("teachers");
        } else if (url.pathname === "/my-courses" || url.pathname === "/my-courses.html") {
          e.preventDefault();
          window.history.pushState({}, "", "/my-courses");
          setCurrentPage("my-courses");
        } else if (url.pathname === "/teacher-courses" || url.pathname === "/teacher-courses.html") {
          e.preventDefault();
          window.history.pushState({}, "", "/teacher-courses");
          setCurrentPage("teacher-courses");
        } else if (url.pathname === "/" || url.pathname === "/index" || url.pathname === "/index.html") {
          e.preventDefault();
          window.history.pushState({}, "", "/");
          setCurrentPage("home");
        }
      }
    };

    window.addEventListener("click", handleNavigation);
    window.addEventListener("popstate", updatePage);

    return () => {
      window.removeEventListener("click", handleNavigation);
      window.removeEventListener("popstate", updatePage);
    };
  }, []);

  if (currentPage === "courses") {
    return <CoursesPage />;
  }

  if (currentPage === "teachers") {
    return <TeachersPage />;
  }

  if (currentPage === "my-courses") {
    return <MyCoursesPage />;
  }

  if (currentPage === "teacher-courses") {
    return <TeacherCoursesPage />;
  }

  return <HomePage />;
}

export default App;
