// Courses filter and search functionality

let currentCategory = 'all';

function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function filterCourses() {
    applyFilters();
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const coursesGrid = document.getElementById('coursesGrid');
    const courseCards = coursesGrid ? coursesGrid.querySelectorAll('.course-card') : [];
    const noResults = document.getElementById('noResults');
    
    let visibleCount = 0;
    
    courseCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const title = card.querySelector('.course-title').textContent.toLowerCase();
        const description = card.querySelector('.course-description').textContent.toLowerCase();
        
        const matchesCategory = currentCategory === 'all' || category === currentCategory;
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        
        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    applyFilters();
});