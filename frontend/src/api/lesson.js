const API_URL = "http://localhost:8080";

export async function getLessonsByCourse(courseId) {
  const res = await fetch(`${API_URL}/course/${courseId}/lessons`);

  if (!res.ok) {
    throw new Error("Ошибка загрузки уроков");
  }

  return res.json();
}

export async function getLessonById(lessonId) {
  const res = await fetch(`${API_URL}/lesson/${lessonId}`);

  if (!res.ok) {
    throw new Error("Ошибка загрузки урока");
  }

  return res.json();
}

export async function createLesson(courseId, title, content, orderNum) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      course_id: courseId,
      title,
      content,
      order_num: orderNum,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 401) {
      throw new Error("Необходимо войти в систему");
    }

    if (res.status === 400) {
      throw new Error(errorData.error || "Неверные данные");
    }

    throw new Error(errorData.error || "Ошибка при создании урока");
  }

  return res.json();
}

export async function updateLesson(lessonId, title, content, orderNum, courseId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/lesson/${lessonId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      course_id: courseId,
      title,
      content,
      order_num: orderNum,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Ошибка при обновлении урока");
  }

  return res.json();
}

export async function deleteLesson(lessonId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/lesson/${lessonId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Ошибка при удалении урока");
  }

  return true;
}
