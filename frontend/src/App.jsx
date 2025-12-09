import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import TeachersPage from "./pages/TeachersPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import { fetchUser } from "./api/auth";

function App() {
  const [modalState, setModalState] = useState({ open: false, mode: "login" });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const u = await fetchUser();
        setUser(u);
      } catch (err) {
        console.error("Ошибка восстановления пользователя:", err);
        localStorage.removeItem("token");
      } finally {
        setAuthLoading(false);
      }
    };
    restoreUser();
  }, []);

  return (
    <BrowserRouter>
      <Header
        user={user}
        authLoading={authLoading}
        onLogin={() => setModalState({ open: true, mode: "login" })}
        onRegister={() => setModalState({ open: true, mode: "register" })}
        onToggleMenu={() => console.log("Мобильное меню")}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              onRequireAuth={() => setModalState({ open: true, mode: "login" })}
            />
          }
        />
        <Route
          path="/courses"
          element={
            <CoursesPage
              user={user}
              onRequireAuth={() => setModalState({ open: true, mode: "login" })}
            />
          }
        />
        <Route path="/teachers" element={<TeachersPage user={user} />} />
        <Route path="/my-courses" element={<MyCoursesPage user={user} />} />
        <Route path="/teacher-courses" element={<TeacherCoursesPage user={user} />} />
      </Routes>

      <Footer />

      <AuthModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, mode: "login" })}
        mode={modalState.mode}
        onToggleMode={() =>
          setModalState({
            open: true,
            mode: modalState.mode === "login" ? "register" : "login"
          })
        }
        onSuccess={(userData) => setUser(userData)}
      />
    </BrowserRouter>
  );
}

export default App;
