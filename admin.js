document.addEventListener('DOMContentLoaded', function() {
    // Переключение бокового меню
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('show')) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    // Анимация карточек статистики
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Обработка быстрых действий
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach(button => {
        button.addEventListener('click', function() {
            const actionText = this.querySelector('span').textContent;
            showNotification(`Действие: ${actionText}`);
            
            // Анимация нажатия
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Анимация графиков
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        const height = bar.style.height;
        bar.style.height = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'height 1s ease';
            bar.style.height = height;
        }, 500);
    });

    // Уведомления
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('Показаны все уведомления');
            this.querySelector('.notification-count').textContent = '0';
        });
    }

    // Поиск
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                showNotification(`Поиск: "${this.value}"`);
                this.value = '';
            }
        });
    }

    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 10000;
            border-left: 4px solid ${type === 'error' ? '#f56565' : '#48bb78'};
        `;
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Убираем через 3 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Обновление времени активности
    function updateActivityTimes() {
        const times = document.querySelectorAll('.activity-time');
        times.forEach(time => {
            const text = time.textContent;
            if (text.includes('минут')) {
                const minutes = parseInt(text);
                if (minutes < 60) {
                    time.textContent = `${minutes + 1} минут назад`;
                }
            } else if (text.includes('час')) {
                const hours = parseInt(text);
                time.textContent = `${hours + 1} час назад`;
            }
        });
    }

    // Имитация обновления данных
    setInterval(updateActivityTimes, 60000);

    // Добавляем CSS переменные для совместимости
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Функция для обновления статистики
function updateStats(users, teachers, students, classes) {
    const statNumbers = document.querySelectorAll('.stat-content h3');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = users.toLocaleString();
        statNumbers[1].textContent = teachers;
        statNumbers[2].textContent = students.toLocaleString();
        statNumbers[3].textContent = classes;
    }
}