// Modal Functions
function showModal(type) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('modalTitle');
    const nameField = document.getElementById('nameField');
    const toggleText = document.getElementById('toggleText');
    const subtitle = document.querySelector('.modal-subtitle');
    
    modal.style.display = 'flex';
    
    if (type === 'register') {
        title.textContent = 'Регистрация';
        subtitle.textContent = 'Создайте аккаунт для начала обучения';
        nameField.style.display = 'block';
        toggleText.innerHTML = 'Уже есть аккаунт? <a onclick="toggleModal()">Войти</a>';
    } else {
        title.textContent = 'Вход в систему';
        subtitle.textContent = 'Войдите, чтобы продолжить обучение';
        nameField.style.display = 'none';
        toggleText.innerHTML = 'Нет аккаунта? <a onclick="toggleModal()">Зарегистрироваться</a>';
    }
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleModal() {
    const title = document.getElementById('modalTitle');
    if (title.textContent === 'Вход в систему') {
        showModal('register');
    } else {
        showModal('login');
    }
}

// Scroll Functions
function scrollTo(section) {
    const element = document.getElementById(section);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Course Functions
function enrollCourse(courseName) {
    alert(`Вы записались на курс "${courseName}"!\n\nПожалуйста, залогинтесь или зарегистрируйтесь для продолжения.`);
    showModal('login');
}

function continueCourse(courseName) {
    alert(`Продолжаем обучение на курсе "${courseName}"!\n\n(Это демонстрационная версия)`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    // Handle form submission
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Форма отправлена! (Это демонстрационный сайт)');
            closeModal();
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('show');
}

