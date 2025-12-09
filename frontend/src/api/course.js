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

export async function getCoursesByTeacher(teacherId) {
  const res = await fetch(`${API_URL}/course`);

  if (!res.ok) {
    throw new Error("Ошибка загрузки курсов");
  }

  const data = await res.json();
  return data.filter(course => course.teacher_id === teacherId);
}
