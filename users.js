document.addEventListener('DOMContentLoaded', function() {
    // Данные пользователей
    let usersData = JSON.parse(localStorage.getItem('usersData')) || [
        {
            id: 1,
            fullName: 'Иванов Иван Иванович',
            login: 'ivanov_i',
            role: 'Ученик',
            class: '10-А',
            email: 'ivanov@school.ru',
            phone: '+7 (912) 345-67-89',
            status: 'active',
            lastActivity: '2024-01-15 14:30',
            password: 'password123'
        },
        {
            id: 2,
            fullName: 'Петрова Анна Сергеевна',
            login: 'petrova_a',
            role: 'Учитель',
            class: '-',
            email: 'petrova@school.ru',
            phone: '+7 (923) 456-78-90',
            status: 'active',
            lastActivity: '2024-01-15 13:45',
            password: 'password123'
        },
        {
            id: 3,
            fullName: 'Сидоров Алексей Петрович',
            login: 'sidorov_a',
            role: 'Ученик',
            class: '10-Б',
            email: 'sidorov@school.ru',
            phone: '+7 (934) 567-89-01',
            status: 'inactive',
            lastActivity: '2024-01-14 10:20',
            password: 'password123'
        }
    ];

    // Переменные состояния
    let currentPage = 1;
    const itemsPerPage = 5;
    let filteredUsers = [...usersData];
    let currentEditingUser = null;

    // Инициализация
    function init() {
        initUsersTable();
        setupEventListeners();
        updatePagination();
        applyFilters();
        saveToLocalStorage();
        createUserDetailsModal(); // Создаем модальное окно при инициализации
    }

    // Сохранение в LocalStorage
    function saveToLocalStorage() {
        localStorage.setItem('usersData', JSON.stringify(usersData));
    }

    // Инициализация таблицы
    function initUsersTable() {
        renderTable();
        addTableEventListeners();
    }

    // Рендер таблицы
    function renderTable() {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const usersToShow = filteredUsers.slice(startIndex, endIndex);

        if (usersToShow.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data">
                        <i class="fas fa-users"></i>
                        <p>Пользователи не найдены</p>
                    </td>
                </tr>
            `;
            return;
        }

        usersToShow.forEach(user => {
            const row = document.createElement('tr');
            
            const statusClass = user.status === 'active' ? 'status-active' : 
                              user.status === 'inactive' ? 'status-inactive' : 'status-pending';
            const statusText = user.status === 'active' ? 'Активный' : 
                             user.status === 'inactive' ? 'Неактивный' : 'Ожидание';

            let roleClass = '';
            switch(user.role) {
                case 'Администратор': roleClass = 'role-admin'; break;
                case 'Учитель': roleClass = 'role-teacher'; break;
                case 'Ученик': roleClass = 'role-student'; break;
                case 'Родитель': roleClass = 'role-parent'; break;
            }

            row.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="user-checkbox" data-id="${user.id}">
                </td>
                <td>
                    <div class="user-info-cell">
                        <strong>${user.fullName}</strong>
                        <span class="user-phone">${user.phone}</span>
                    </div>
                </td>
                <td>${user.login}</td>
                <td>
                    <span class="role-badge ${roleClass}">${user.role}</span>
                </td>
                <td>${user.class}</td>
                <td>
                    <a href="mailto:${user.email}" class="email-link">${user.email}</a>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>${formatDate(user.lastActivity)}</td>
                <td class="actions-cell">
                    <div class="table-actions">
                        <button class="action-btn view" data-id="${user.id}" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" data-id="${user.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${user.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        updateTableInfo();
        updateDeleteButtonState();
        updateSelectAllCheckbox();
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
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

        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function(e) {
                applyFilters();
            }, 300));
        }

        // Фильтрация
        const filterBtn = document.querySelector('.btn-secondary');
        if (filterBtn) {
            filterBtn.addEventListener('click', function() {
                applyFilters();
            });
        }

        // Сброс фильтров
        const resetBtn = document.querySelector('.filter-actions .btn-outline');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                const roleFilter = document.getElementById('roleFilter');
                const statusFilter = document.getElementById('statusFilter');
                const classFilter = document.getElementById('classFilter');
                const searchInput = document.getElementById('searchInput');
                
                if (roleFilter) roleFilter.value = 'all';
                if (statusFilter) statusFilter.value = 'all';
                if (classFilter) classFilter.value = 'all';
                if (searchInput) searchInput.value = '';
                
                applyFilters();
            });
        }

        // Добавление пользователя
        const addUserBtn = document.querySelector('.btn-primary');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                currentEditingUser = null;
                showModal();
            });
        }

        // Удаление пользователей
        const deleteBtn = document.querySelector('.btn-danger');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const selectedIds = getSelectedUserIds();
                if (selectedIds.length > 0) {
                    deleteUsers(selectedIds);
                } else {
                    showNotification('Выберите хотя бы одного пользователя для удаления', 'warning');
                }
            });
        }

        // Экспорт
        const exportBtn = document.querySelector('.header-actions .btn-outline');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                exportData();
            });
        }

        // Пагинация
        setupPaginationListeners();

        // Модальное окно
        setupModalListeners();
    }

    // Обработчики таблицы
    function addTableEventListeners() {
        // Выбор всех checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
                updateDeleteButtonState();
            });
        }

        // Действия с пользователями
        document.addEventListener('click', function(e) {
            if (e.target.closest('.action-btn')) {
                const button = e.target.closest('.action-btn');
                const userId = parseInt(button.getAttribute('data-id'));
                const action = button.classList[1];
                
                handleUserAction(userId, action);
            }
        });

        // Выбор отдельных пользователей
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('user-checkbox')) {
                updateDeleteButtonState();
                updateSelectAllCheckbox();
            }
        });
    }

    // Обработка действий с пользователем
    function handleUserAction(userId, action) {
        const user = usersData.find(u => u.id === userId);
        if (!user) return;
        
        switch(action) {
            case 'view':
                showUserDetails(user);
                break;
            case 'edit':
                editUser(user);
                break;
            case 'delete':
                deleteUser(user);
                break;
        }
    }

    // Показать детали пользователя
    function showUserDetails(user) {
        const modal = document.getElementById('userDetailsModal');
        if (!modal) {
            createUserDetailsModal();
            // После создания модального окна снова вызываем функцию
            setTimeout(() => showUserDetails(user), 100);
            return;
        }

        // Заполняем данные
        const setName = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value || 'Не указано';
        };

        setName('detailName', user.fullName);
        setName('detailLogin', user.login);
        setName('detailRole', user.role);
        setName('detailClass', user.class);
        setName('detailEmail', user.email);
        setName('detailPhone', user.phone);
        setName('detailStatus', user.status === 'active' ? 'Активный' : 'Неактивный');
        setName('detailLastActivity', formatDate(user.lastActivity));

        // Показываем модальное окно
        modal.classList.add('show');
    }

    // Редактировать пользователя
    function editUser(user) {
        currentEditingUser = user;
        fillEditForm(user);
        showModal();
    }

    // Заполнить форму редактирования
    function fillEditForm(user) {
        const form = document.getElementById('addUserForm');
        if (!form) return;

        const names = user.fullName.split(' ');
        
        // Исправленные селекторы
        const setValue = (name, value) => {
            const element = form.querySelector(`[name="${name}"]`);
            if (element) element.value = value || '';
        };

        setValue('lastName', names[0]);
        setValue('firstName', names[1]);
        setValue('middleName', names[2]);
        setValue('login', user.login);
        setValue('password', user.password);
        setValue('email', user.email);
        setValue('phone', user.phone);
        setValue('role', user.role);
        setValue('class', user.class);
        
        // Обновляем заголовок модального окна
        const modalTitle = document.querySelector('.modal-header h3');
        if (modalTitle) modalTitle.textContent = 'Редактирование пользователя';
    }

    // Удалить пользователя
    function deleteUser(user) {
        if (confirm(`Вы уверены, что хотите удалить пользователя ${user.fullName}?`)) {
            const index = usersData.findIndex(u => u.id === user.id);
            if (index !== -1) {
                usersData.splice(index, 1);
                saveToLocalStorage();
                applyFilters();
                showNotification(`Пользователь ${user.fullName} удален`, 'success');
            }
        }
    }

    // Удалить нескольких пользователей
    function deleteUsers(userIds) {
        const userNames = usersData
            .filter(user => userIds.includes(user.id))
            .map(user => user.fullName)
            .join(', ');

        if (confirm(`Вы уверены, что хотите удалить выбранных пользователей: ${userNames}?`)) {
            usersData = usersData.filter(user => !userIds.includes(user.id));
            saveToLocalStorage();
            applyFilters();
            showNotification(`Удалено пользователей: ${userIds.length}`, 'success');
        }
    }

    // Применить фильтры
    function applyFilters() {
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        const classFilter = document.getElementById('classFilter');
        const searchInput = document.getElementById('searchInput');

        const roleValue = roleFilter ? roleFilter.value : 'all';
        const statusValue = statusFilter ? statusFilter.value : 'all';
        const classValue = classFilter ? classFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        filteredUsers = usersData.filter(user => {
            const matchesRole = roleValue === 'all' || user.role === roleValue;
            const matchesStatus = statusValue === 'all' || user.status === statusValue;
            const matchesClass = classValue === 'all' || user.class === classValue;
            const matchesSearch = searchTerm === '' || 
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.login.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);

            return matchesRole && matchesStatus && matchesClass && matchesSearch;
        });

        currentPage = 1;
        renderTable();
        updatePagination();
    }

    // Пагинация
    function setupPaginationListeners() {
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:last-child');
        const pageBtns = document.querySelectorAll('.page-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                    updatePagination();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                    updatePagination();
                }
            });
        }

        pageBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const page = parseInt(this.textContent);
                if (page !== currentPage) {
                    currentPage = page;
                    renderTable();
                    updatePagination();
                }
            });
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        const pageBtns = document.querySelectorAll('.page-btn');
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:last-child');

        pageBtns.forEach(btn => {
            const page = parseInt(btn.textContent);
            btn.classList.toggle('active', page === currentPage);
            btn.style.display = page <= totalPages ? 'flex' : 'none';
        });

        if (prevBtn) {
            prevBtn.disabled = currentPage === 1;
            prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        }

        if (nextBtn) {
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
        }
    }

    // Модальное окно
    function setupModalListeners() {
        const modal = document.getElementById('addUserModal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.querySelector('.form-actions .btn-outline');
        const form = document.getElementById('addUserForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                if (currentEditingUser) {
                    updateUser();
                } else {
                    addNewUser();
                }
            });
        }

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const addModal = document.getElementById('addUserModal');
                const viewModal = document.getElementById('userDetailsModal');
                
                if (addModal && addModal.classList.contains('show')) {
                    closeModal();
                }
                if (viewModal && viewModal.classList.contains('show')) {
                    viewModal.classList.remove('show');
                }
            }
        });
    }

    function showModal() {
        const modal = document.getElementById('addUserModal');
        const title = document.querySelector('.modal-header h3');
        
        if (!modal) return;
        
        if (currentEditingUser && title) {
            title.textContent = 'Редактирование пользователя';
        } else if (title) {
            title.textContent = 'Добавление пользователя';
            const form = document.getElementById('addUserForm');
            if (form) form.reset();
        }
        
        modal.classList.add('show');
    }

    function closeModal() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.classList.remove('show');
            const form = document.getElementById('addUserForm');
            if (form) form.reset();
            currentEditingUser = null;
        }
    }

    function addNewUser() {
        const formData = getFormData();
        
        if (!validateForm(formData)) {
            showNotification('Заполните все обязательные поля', 'error');
            return;
        }

        const newUser = {
            id: Math.max(...usersData.map(u => u.id), 0) + 1,
            fullName: `${formData.lastName} ${formData.firstName} ${formData.middleName || ''}`.trim(),
            login: formData.login,
            role: formData.role,
            class: formData.class,
            email: formData.email,
            phone: formData.phone,
            status: 'active',
            lastActivity: new Date().toISOString(),
            password: formData.password
        };

        usersData.unshift(newUser);
        saveToLocalStorage();
        applyFilters();
        showNotification('Пользователь успешно добавлен', 'success');
        closeModal();
    }

    function updateUser() {
        const formData = getFormData();
        
        if (!validateForm(formData)) {
            showNotification('Заполните все обязательные поля', 'error');
            return;
        }

        const userIndex = usersData.findIndex(u => u.id === currentEditingUser.id);
        if (userIndex !== -1) {
            usersData[userIndex] = {
                ...usersData[userIndex],
                fullName: `${formData.lastName} ${formData.firstName} ${formData.middleName || ''}`.trim(),
                login: formData.login,
                role: formData.role,
                class: formData.class,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };

            saveToLocalStorage();
            applyFilters();
            showNotification('Пользователь успешно обновлен', 'success');
            closeModal();
        }
    }

    function getFormData() {
        const form = document.getElementById('addUserForm');
        if (!form) return {};
        
        const getValue = (name) => {
            const element = form.querySelector(`[name="${name}"]`);
            return element ? element.value : '';
        };

        return {
            lastName: getValue('lastName'),
            firstName: getValue('firstName'),
            middleName: getValue('middleName'),
            login: getValue('login'),
            password: getValue('password'),
            email: getValue('email'),
            phone: getValue('phone'),
            role: getValue('role'),
            class: getValue('class')
        };
    }

    function validateForm(formData) {
        return formData.lastName && formData.firstName && formData.login && formData.password && formData.role;
    }

    // Создать модальное окно просмотра
    function createUserDetailsModal() {
        // Удаляем существующее модальное окно если есть
        const existingModal = document.getElementById('userDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'userDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Просмотр пользователя</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-details-grid">
                        <div class="detail-item">
                            <label>ФИО:</label>
                            <span id="detailName"></span>
                        </div>
                        <div class="detail-item">
                            <label>Логин:</label>
                            <span id="detailLogin"></span>
                        </div>
                        <div class="detail-item">
                            <label>Роль:</label>
                            <span id="detailRole"></span>
                        </div>
                        <div class="detail-item">
                            <label>Класс:</label>
                            <span id="detailClass"></span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span id="detailEmail"></span>
                        </div>
                        <div class="detail-item">
                            <label>Телефон:</label>
                            <span id="detailPhone"></span>
                        </div>
                        <div class="detail-item">
                            <label>Статус:</label>
                            <span id="detailStatus"></span>
                        </div>
                        <div class="detail-item">
                            <label>Последняя активность:</label>
                            <span id="detailLastActivity"></span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeDetails">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Добавляем обработчики для модального окна просмотра
        const closeBtn = modal.querySelector('.modal-close');
        const closeDetailsBtn = modal.querySelector('#closeDetails');

        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('show');
            });
        }

        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', function() {
                modal.classList.remove('show');
            });
        }

        // Закрытие по клику вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Вспомогательные функции
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Неизвестно';
        }
    }

    function getSelectedUserIds() {
        const checkboxes = document.querySelectorAll('.user-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => parseInt(checkbox.getAttribute('data-id')));
    }

    function updateDeleteButtonState() {
        const deleteBtn = document.querySelector('.btn-danger');
        const selectedCount = getSelectedUserIds().length;
        
        if (deleteBtn) {
            deleteBtn.disabled = selectedCount === 0;
            deleteBtn.style.opacity = selectedCount === 0 ? '0.5' : '1';
        }
    }

    function updateSelectAllCheckbox() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.user-checkbox');
        const checkedCount = document.querySelectorAll('.user-checkbox:checked').length;
        
        if (selectAll && checkboxes.length > 0) {
            selectAll.checked = checkedCount === checkboxes.length;
            selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
        }
    }

    function updateTableInfo() {
        const infoElement = document.querySelector('.table-info');
        if (infoElement && filteredUsers.length > 0) {
            const startIndex = (currentPage - 1) * itemsPerPage + 1;
            const endIndex = Math.min(startIndex + itemsPerPage - 1, filteredUsers.length);
            infoElement.innerHTML = `Показано <strong>${startIndex}-${endIndex}</strong> из ${filteredUsers.length} пользователей`;
        } else if (infoElement) {
            infoElement.innerHTML = 'Пользователи не найдены';
        }
    }

    function exportData() {
        showNotification('Данные экспортированы в CSV', 'success');
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 10000;
            border-left: 4px solid ${getNotificationColor(type)};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'warning': return 'exclamation-triangle';
            case 'error': return 'exclamation-circle';
            default: return 'info-circle';
        }
    }

    function getNotificationColor(type) {
        switch(type) {
            case 'success': return '#48bb78';
            case 'warning': return '#ed8936';
            case 'error': return '#f56565';
            default: return '#4299e1';
        }
    }

    // Добавляем дополнительные стили
    const style = document.createElement('style');
    style.textContent = `
        .role-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .role-admin { background: #fed7d7; color: #c53030; }
        .role-teacher { background: #feebcb; color: #c05621; }
        .role-student { background: #c6f6d5; color: #2f855a; }
        .role-parent { background: #e9d8fd; color: #6b46c1; }
        
        .user-info-cell {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .user-phone {
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .email-link {
            color: var(--primary);
            text-decoration: none;
        }
        
        .email-link:hover {
            text-decoration: underline;
        }
        
        .pagination-btn:disabled {
            cursor: not-allowed;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: var(--text-muted);
        }
        
        .no-data i {
            font-size: 3rem;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        .no-data p {
            font-size: 1.1rem;
            margin: 0;
        }
        
        .user-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .detail-item label {
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        .detail-item span {
            color: var(--text-primary);
            font-size: 0.95rem;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid var(--border-light);
            display: flex;
            justify-content: flex-end;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-muted);
            padding: 4px;
            border-radius: var(--radius);
            transition: var(--transition);
        }

        .modal-close:hover {
            color: var(--danger);
            background: var(--background);
        }
    `;
    document.head.appendChild(style);

    // Запускаем инициализацию
    init();
});