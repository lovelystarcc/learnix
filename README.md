# Learnix - Learning Management System

Полнофункциональная система управления обучением (LMS) для онлайн-курсов.

## Технологии

- **Backend**: Go 1.25+ (go-chi/chi v5, GORM)
- **Frontend**: React 19 (Vite 7, React Router v7)
- **База данных**: PostgreSQL 15
- **Контейнеризация**: Docker & Docker Compose

## Быстрый старт

### Требования

- [Docker](https://docs.docker.com/get-docker/) и [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/learnix.git
cd learnix
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
DB_USER=user
DB_PASSWORD=your_secure_password
DB_NAME=learnix_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY_HOURS=24

# Окружение
ENVIRONMENT=local
```

### 3. Запуск приложения

```bash
docker-compose up
```

Или в фоновом режиме:

```bash
docker-compose up -d
```

### 4. Доступ к сервисам

После запуска сервисы будут доступны по адресам:

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:8081 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

## Остановка приложения

```bash
docker-compose down
```

Для удаления данных базы:

```bash
docker-compose down -v
```

## Структура проекта

```
learnix/
├── backend/           # Go backend
│   ├── cmd/          # Точка входа приложения
│   └── internal/     # Внутренние пакеты
├── frontend/         # React frontend
│   └── src/          # Исходный код
├── db/
│   └── migrations/   # SQL миграции
└── docker-compose.yml
```

## API Endpoints

### Публичные

- `POST /user/register` - Регистрация
- `POST /user/login` - Авторизация (возвращает JWT)
- `GET /course` - Список курсов
- `GET /course/{id}` - Информация о курсе
- `GET /course/{id}/lessons` - Уроки курса
- `GET /teacher` - Список преподавателей

### Защищённые (требуют JWT)

- `GET /user/me` - Профиль пользователя
- `POST /course` - Создание курса
- `POST /lesson` - Создание урока
- `POST /enrollment` - Запись на курс

## Переменные окружения

| Переменная | Обязательная | По умолчанию | Описание |
|------------|--------------|--------------|----------|
| `DB_USER` | Нет | user | Пользователь PostgreSQL |
| `DB_PASSWORD` | Да | - | Пароль PostgreSQL |
| `DB_NAME` | Нет | learnix_db | Имя базы данных |
| `JWT_SECRET` | Да | - | Секрет для JWT токенов |
| `JWT_EXPIRY_HOURS` | Нет | 1 | Время жизни токена (часы) |
| `ENVIRONMENT` | Нет | local | Окружение: local, development, production |

## Лицензия

MIT License - см. файл [LICENSE](LICENSE)
