const API_URL = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Ошибка авторизации");
  }

  return res.json();
}

export async function register(email, password, fullName, role) {
  try {
    const res = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${res.status}`;
      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:8080"
      );
    }
    throw error;
  }
}

export async function fetchUser() {
  const token = getToken();
  if (!token) {
    throw new Error("Токен отсутствует");
  }

  const res = await fetch(`${API_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Необходимо войти в систему");
    }
    throw new Error("Не удалось восстановить пользователя");
  }

  const data = await res.json();
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name || data.fullName || data.email,
    role: data.role,
  };
}
