export async function login(email, password) {
  const res = await fetch("http://localhost:8080/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password}),
  });

  if (!res.ok) {
    throw new Error("Ошибка авторизации");
  }

  return res.json();
}

export async function register(email, password, fullName, role) {
  try {
    const res = await fetch("http://localhost:8080/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: password, full_name: fullName, role }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${res.status}`;
      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error) {
    // Если это уже Error с сообщением, пробрасываем дальше
    if (error instanceof Error && error.message) {
      throw error;
    }
    // Если это ошибка сети (failed to fetch)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:8080");
    }
    throw new Error("Ошибка регистрации: " + error.message);
  }
}

export async function fetchUser(setUser, setAuthLoading) {
  const token = localStorage.getItem("token");
  if (!token) {
    setAuthLoading(false);
    return;
  }

  await fetch("http://localhost:8080/user/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Не удалось восстановить пользователя");
      return res.json();
    })
    .then((data) => {
      setUser({
        email: data.email,
        fullName: data.full_name || data.fullName || data.email,
        id: data.id,
        role: data.role,
      });
    })
    .catch((err) => {
      console.error("Ошибка восстановления пользователя:", err);
      localStorage.removeItem("token");
    })
    .finally(() => setAuthLoading(false));
}