const API_URL = "http://localhost:8080";

export async function createTeacher(bio, specialization, technologies) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/teacher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bio,
      specialization,
      technologies,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    
    if (res.status === 401) {
      throw new Error("Необходимо войти в систему");
    }
    
    if (res.status === 400) {
      throw new Error(errorData.error || "Неверные данные. Проверьте заполнение формы.");
    }
    
    if (res.status === 409) {
      throw new Error("Вы уже зарегистрированы как преподаватель");
    }
    
    if (res.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }
    
    throw new Error(errorData.error || "Ошибка при создании заявки");
  }

  return res.json();
}

export const getTeachers = async () => {
  const res = await fetch(`${API_URL}/teacher`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 401) {
      throw new Error("Необходимо войти в систему");
    }

    if (res.status === 404) {
      throw new Error("Преподаватели не найдены");
    }

    if (res.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }

    throw new Error(errorData.error || "Ошибка загрузки преподавателей");
  }

  return res.json();
};

export const getTeacherById = async (teacherId) => {
  const res = await fetch(`${API_URL}/teacher/${teacherId}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 404) {
      throw new Error("Преподаватель не найден");
    }

    if (res.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }

    throw new Error(errorData.error || "Ошибка загрузки преподавателя");
  }

  return res.json();
};
