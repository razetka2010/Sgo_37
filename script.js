document.addEventListener('DOMContentLoaded', function() {

    // 1. Инициализация анимированного фона (частицы)
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 35,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                }
            },
            "opacity": {
                "value": 0.25,
                "random": true,
            },
            "size": {
                "value": 2.5,
                "random": true,
            },
            "line_linked": {
                "enable": true,
                "distance": 130,
                "color": "#ffffff",
                "opacity": 0.15,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1.5,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            }
        },
        "retina_detect": true
    });

    // 2. Переключение видимости пароля
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            // Меняем тип поля
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Меняем иконку
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // 3. Обработка отправки формы (имитация входа)
    const loginForm = document.querySelector('.login-form');
    const notification = document.getElementById('notification');
    const loginCard = document.querySelector('.login-card');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Отменяем стандартную отправку

            const username = document.getElementById('username').value;
            const password = passwordInput.value;

            // Простейшая проверка (в реальном проекте это будет запрос к серверу)
            if (username === 'admin' && password === 'admin') {
                // Симуляция успешного входа
                loginCard.style.animation = 'cardAppear 0.8s ease-out forwards';
                setTimeout(() => {
                    alert('Вход выполнен! Добро пожаловать, ' + username);
                    // Здесь будет редирект на главную страницу
                    // window.location.href = 'dashboard.html';
                }, 500);
            } else {
                // Показываем уведомление об ошибке
                if (notification) {
                    notification.classList.add('show');
                    // Убираем уведомление через 3 секунды
                    setTimeout(() => {
                        notification.classList.remove('show');
                    }, 3000);
                }
                
                // Добавляем анимацию "тряски" формы при ошибке
                if (loginCard) {
                    loginCard.classList.add('error');
                    setTimeout(() => {
                        loginCard.classList.remove('error');
                    }, 600);
                }
            }
        });
    }

    // 4. Добавляем плавное появление элементов при загрузке
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.zIndex = '10';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.zIndex = '1';
        });
    });

    // 5. Автофокус на поле логина при загрузке
    const usernameField = document.getElementById('username');
    if (usernameField) {
        setTimeout(() => {
            usernameField.focus();
        }, 500);
    }

});