const API_URL = "http://localhost:8080";

export async function createCourse(title, description, courseType, durationWeeks, teacherId) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/course`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      course_type: courseType,
      duration_weeks: durationWeeks,
      teacher_id: teacherId,
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
    
    if (res.status >= 500) {
      throw new Error("Ошибка сервера. Попробуйте позже.");
    }
    
    throw new Error(errorData.error || "Ошибка при создании курса");
  }

  return res.json();
}

export async function getCourses() {
  const res = await fetch(`${API_URL}/course`);
  
  if (!res.ok) {
    throw new Error("Ошибка загрузки курсов");
  }
  
  return res.json();
}

export async function getCourseById(courseId) {
  const res = await fetch(`${API_URL}/course/${courseId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Курс не найден");
    }
    throw new Error("Ошибка загрузки курса");
  }

  return res.json();
}

export async function getCoursesByTeacher(teacherId) {
  const res = await fetch(`${API_URL}/course?teacher_id=${teacherId}`);

  if (!res.ok) {
    throw new Error("Ошибка загрузки курсов");
  }

  return res.json();
}

export async function searchCourses(query = "", courseType = "", limit = 20, offset = 0) {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (courseType) params.append("type", courseType);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const res = await fetch(`${API_URL}/course/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Ошибка поиска курсов");
  }

  return res.json();
}

export async function updateCourse(courseId, title, description, courseType, durationWeeks) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/course/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      course_type: courseType,
      duration_weeks: durationWeeks,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    
    if (res.status === 401) {
      throw new Error("Необходимо войти в систему");
    }
    
    if (res.status === 404) {
      throw new Error("Курс не найден");
    }
    
    throw new Error(errorData.error || "Ошибка при обновлении курса");
  }

  return res.json();
}

export async function deleteCourse(courseId) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Необходимо войти в систему");
  }

  const res = await fetch(`${API_URL}/course/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Необходимо войти в систему");
    }
    
    if (res.status === 404) {
      throw new Error("Курс не найден");
    }
    
    throw new Error("Ошибка при удалении курса");
  }

  return true;
}
