const API_URL = "http://localhost:8080";

export async function getEnrollmentsByStudent(studentId) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/enrollment?student_id=${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    
    if (res.status === 401) {
      throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
    }
    
    if (res.status === 404) {
      throw new Error("Пользователь не найден");
    }
    
    if (res.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }
    
    throw new Error(errorData.error || "Ошибка загрузки данных о курсах");
  }

  return res.json();
}

export async function createEnrollment(courseId, studentId) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/enrollment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      course_id: courseId,
      student_id: studentId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 401) {
      throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
    }

    if (res.status === 409) {
      throw new Error("Вы уже записаны на этот курс");
    }

    if (res.status === 400) {
      throw new Error(errorData.error || "Некорректные данные для записи на курс");
    }

    if (res.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }

    throw new Error(errorData.error || "Не удалось записаться на курс");
  }

  return res.json();
}

export async function updateEnrollmentProgress(enrollmentId, progress) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/enrollment/${enrollmentId}/progress`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ progress }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 401) {
      throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
    }

    if (res.status === 404) {
      throw new Error("Запись не найдена");
    }

    throw new Error(errorData.error || "Не удалось обновить прогресс");
  }

  return res.json();
}

export async function updateEnrollmentStatus(enrollmentId, status) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/enrollment/${enrollmentId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 401) {
      throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
    }

    if (res.status === 404) {
      throw new Error("Запись не найдена");
    }

    throw new Error(errorData.error || "Не удалось обновить статус");
  }

  return res.json();
}