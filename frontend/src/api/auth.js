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
  const res = await fetch("http://localhost:8080/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: password, full_name: fullName, role }),
  });

  if (!res.ok) {
    throw new Error("Ошибка регистрации");
  }

  return res.json();
}
