// My Courses page functionality

function switchTab(tab) {
    const activeCourses = document.getElementById('activeCourses');
    const completedCourses = document.getElementById('completedCourses');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Update button states
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide content
    if (tab === 'active') {
        activeCourses.style.display = 'grid';
        completedCourses.style.display = 'none';
    } else {
        activeCourses.style.display = 'none';
        completedCourses.style.display = 'grid';
    }
}

function continueCourse(courseName) {
    alert(`Продолжаем обучение на курсе "${courseName}"!\n\n(Это демонстрационная версия)`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial tab state
    const activeCourses = document.getElementById('activeCourses');
    if (activeCourses) {
        activeCourses.style.display = 'grid';
    }
});