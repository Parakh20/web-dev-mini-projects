// Task Manager Application

// Initialize data and UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Global variables
let tasks = [];
let currentTaskId = 0;
let currentView = 'dashboard';
let isGridView = false;
let editingTaskId = null;
let selectedDate = null;

// Application initialization
function initializeApp() {
    // Load tasks from localStorage or use sample data
    loadTasks();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize views
    initializeDashboard();
    initializeCalendar();
    
    // Show dashboard by default
    switchView('dashboard');
    
    // Update analytics
    updateAnalytics();
}

// Load tasks from localStorage or use sample data
function loadTasks() {
    const storedTasks = localStorage.getItem('taskManagerTasks');
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        
        // Find the highest task ID for new task creation
        if (tasks.length > 0) {
            currentTaskId = Math.max(...tasks.map(task => task.id));
        }
    } else {
        // Use sample data if no stored tasks
        tasks = [
            {
                id: 1,
                title: "Review project proposal",
                description: "Review and provide feedback on the Q2 project proposal",
                dueDate: "2025-06-25",
                priority: "high",
                status: "todo",
                tags: ["work", "review"],
                createdAt: "2025-06-21T10:30:00Z"
            },
            {
                id: 2,
                title: "Update documentation",
                description: "Update API documentation with latest changes",
                dueDate: "2025-06-23",
                priority: "medium",
                status: "in-progress",
                tags: ["development", "documentation"],
                createdAt: "2025-06-20T14:15:00Z"
            },
            {
                id: 3,
                title: "Team meeting preparation",
                description: "Prepare agenda and materials for weekly team meeting",
                dueDate: "2025-06-22",
                priority: "low",
                status: "done",
                tags: ["meeting", "planning"],
                createdAt: "2025-06-19T09:00:00Z"
            }
        ];
        
        currentTaskId = 3;
        saveTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });
    
    // Task view toggle (list/grid)
    document.getElementById('view-toggle').addEventListener('click', toggleViewMode);
    
    // Task filtering
    document.getElementById('priority-filter').addEventListener('change', filterTasks);
    document.getElementById('status-filter').addEventListener('change', filterTasks);
    document.getElementById('task-search').addEventListener('input', filterTasks);
    
    // Task creation/editing
    document.getElementById('fab-btn').addEventListener('click', openTaskModal);
    document.getElementById('quick-add-btn').addEventListener('click', openTaskModal);
    document.getElementById('task-form').addEventListener('submit', saveTask);
    
    // Modal controls
    document.querySelector('.modal-close').addEventListener('click', closeTaskModal);
    document.querySelector('.modal-cancel').addEventListener('click', closeTaskModal);
    
    // Calendar controls
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
    document.getElementById('today-btn').addEventListener('click', goToToday);
    
    // Export/Import
    document.getElementById('export-tasks').addEventListener('click', exportTasks);
    document.getElementById('import-tasks').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importTasks);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+N for new task
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openTaskModal();
        }
        
        // Ctrl+F for search
        if (e.ctrlKey && e.key === 'f' && currentView === 'tasks') {
            e.preventDefault();
            document.getElementById('task-search').focus();
        }
    });
}

// Switch between views (dashboard, tasks, calendar, analytics, profile)
function switchView(view) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(`${view}-view`).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-view="${view}"]`).classList.add('active');
    
    // Update current view
    currentView = view;
    
    // Refresh the view content
    if (view === 'tasks') {
        renderTasks();
    } else if (view === 'dashboard') {
        updateDashboard();
    } else if (view === 'analytics') {
        updateAnalytics();
    } else if (view === 'calendar') {
        if (!selectedDate) {
            goToToday();
        }
    }
    
    showToast(`Viewing ${view}`, 'info');
}

// Initialize dashboard with stats and recent tasks
function initializeDashboard() {
    updateDashboard();
}

// Update dashboard content
function updateDashboard() {
    // Update task statistics
    updateTaskStats();
    
    // Render recent tasks (up to 5)
    const recentTasksList = document.getElementById('recent-tasks-list');
    recentTasksList.innerHTML = '';
    
    // Sort tasks by creation date (most recent first)
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentTasks = sortedTasks.slice(0, 5);
    
    if (recentTasks.length === 0) {
        recentTasksList.innerHTML = '<div class="no-tasks">No tasks yet. Create your first task!</div>';
    } else {
        recentTasks.forEach(task => {
            recentTasksList.appendChild(createTaskElement(task));
        });
    }
}

// Update task statistics
function updateTaskStats() {
    document.getElementById('total-tasks').textContent = tasks.length;
    document.getElementById('completed-tasks').textContent = tasks.filter(task => task.status === 'done').length;
    document.getElementById('progress-tasks').textContent = tasks.filter(task => task.status === 'in-progress').length;
    document.getElementById('high-priority-tasks').textContent = tasks.filter(task => task.priority === 'high').length;
}

// Update analytics view
function updateAnalytics() {
    // Count tasks by status
    const todoCount = tasks.filter(task => task.status === 'todo').length;
    const progressCount = tasks.filter(task => task.status === 'in-progress').length;
    const doneCount = tasks.filter(task => task.status === 'done').length;
    const total = tasks.length || 1; // Avoid division by zero
    
    // Update progress bar
    const todoProgress = document.querySelector('.todo-progress');
    const progressProgress = document.querySelector('.progress-progress');
    const doneProgress = document.querySelector('.done-progress');
    
    todoProgress.style.width = `${(todoCount / total) * 100}%`;
    progressProgress.style.width = `${(progressCount / total) * 100}%`;
    doneProgress.style.width = `${(doneCount / total) * 100}%`;
}

// Render tasks in the tasks view
function renderTasks() {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    
    // Apply filters
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = '<div class="no-tasks">No tasks found. Create a new task!</div>';
        return;
    }
    
    // Apply list/grid view
    if (isGridView) {
        tasksContainer.classList.add('grid-view');
    } else {
        tasksContainer.classList.remove('grid-view');
    }
    
    // Render tasks
    filteredTasks.forEach(task => {
        tasksContainer.appendChild(createTaskElement(task));
    });
}

// Get filtered tasks based on search and filters
function getFilteredTasks() {
    const priorityFilter = document.getElementById('priority-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const searchQuery = document.getElementById('task-search').value.toLowerCase();
    
    return tasks.filter(task => {
        // Priority filter
        if (priorityFilter && task.priority !== priorityFilter) {
            return false;
        }
        
        // Status filter
        if (statusFilter && task.status !== statusFilter) {
            return false;
        }
        
        // Search query
        if (searchQuery) {
            const searchMatches = 
                task.title.toLowerCase().includes(searchQuery) ||
                task.description.toLowerCase().includes(searchQuery) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery)));
            
            if (!searchMatches) {
                return false;
            }
        }
        
        return true;
    });
}

// Filter tasks
function filterTasks() {
    renderTasks();
}

// Create a task element
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    taskItem.setAttribute('data-id', task.id);
    
    const priorityClass = task.priority;
    const statusClass = task.status;
    
    const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    
    // Format tags
    const tagsHtml = task.tags && task.tags.length > 0
        ? task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')
        : '';
    
    taskItem.innerHTML = `
        <div class="task-header">
            <div>
                <h4 class="task-title">${task.title}</h4>
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}">Edit</button>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-meta">
            <span class="task-priority ${priorityClass}">${task.priority}</span>
            <span class="task-status ${statusClass === 'in-progress' ? 'in-progress' : statusClass}">${statusClass === 'in-progress' ? 'in progress' : statusClass}</span>
            <span class="task-due-date">Due: ${formattedDueDate}</span>
        </div>
        <div class="task-tags">${tagsHtml}</div>
    `;
    
    // Add event listeners for edit and delete buttons
    taskItem.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditTaskModal(task.id);
    });
    
    taskItem.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    return taskItem;
}

// Toggle between list and grid view
function toggleViewMode() {
    isGridView = !isGridView;
    
    const tasksContainer = document.getElementById('tasks-container');
    const viewToggleBtn = document.getElementById('view-toggle');
    
    if (isGridView) {
        tasksContainer.classList.add('grid-view');
        viewToggleBtn.textContent = 'List View';
        viewToggleBtn.classList.add('active-grid');
        viewToggleBtn.classList.remove('active-list');
    } else {
        tasksContainer.classList.remove('grid-view');
        viewToggleBtn.textContent = 'Grid View';
        viewToggleBtn.classList.add('active-list');
        viewToggleBtn.classList.remove('active-grid');
    }
    
    showToast(`Switched to ${isGridView ? 'Grid' : 'List'} View`, 'info');
}

// Open task modal for creating a new task
function openTaskModal() {
    // Reset form
    document.getElementById('task-form').reset();
    document.getElementById('modal-title').textContent = 'Add New Task';
    
    // Set default values
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-due-date').value = today;
    document.getElementById('task-priority').value = 'medium';
    document.getElementById('task-status').value = 'todo';
    
    // Clear editing state
    editingTaskId = null;
    
    // Set selected date from calendar if available
    if (selectedDate) {
        document.getElementById('task-due-date').value = selectedDate;
    }
    
    // Show modal
    document.getElementById('task-modal').classList.add('active');
}

// Open task modal for editing an existing task
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === parseInt(taskId));
    
    if (!task) return;
    
    // Set form values
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-due-date').value = task.dueDate || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-tags').value = task.tags ? task.tags.join(', ') : '';
    
    // Set editing state
    editingTaskId = taskId;
    document.getElementById('modal-title').textContent = 'Edit Task';
    
    // Show modal
    document.getElementById('task-modal').classList.add('active');
}

// Close task modal
function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    selectedDate = null;
}

// Save task (create new or update existing)
function saveTask(e) {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;
    const tagsInput = document.getElementById('task-tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === parseInt(editingTaskId));
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title,
                description,
                dueDate,
                priority,
                status,
                tags
            };
            
            showToast('Task updated successfully!', 'success');
        }
    } else {
        // Create new task
        const newTask = {
            id: ++currentTaskId,
            title,
            description,
            dueDate,
            priority,
            status,
            tags,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        showToast('Task created successfully!', 'success');
    }
    
    // Save tasks to localStorage
    saveTasks();
    
    // Close modal
    closeTaskModal();
    
    // Refresh views
    if (currentView === 'tasks') {
        renderTasks();
    } else if (currentView === 'dashboard') {
        updateDashboard();
    } else if (currentView === 'calendar') {
        renderCalendarDays();
    }
    
    // Update analytics
    updateAnalytics();
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        // Remove task from array
        tasks = tasks.filter(task => task.id !== parseInt(taskId));
        
        // Save to localStorage
        saveTasks();
        
        // Refresh views
        if (currentView === 'tasks') {
            renderTasks();
        } else if (currentView === 'dashboard') {
            updateDashboard();
        } else if (currentView === 'calendar') {
            renderCalendarDays();
        }
        
        // Update analytics
        updateAnalytics();
        
        showToast('Task deleted successfully!', 'success');
    }
}

// Show toast notification
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    
    if (type) {
        toast.classList.add(type);
    }
    
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Calendar functions
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initializeCalendar() {
    updateCalendarHeader();
    renderCalendarDays();
}

function updateCalendarHeader() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    document.getElementById('current-month-year').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
}

function renderCalendarDays() {
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // Get first day of month and last day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get number of days in month
    const daysInMonth = lastDay.getDate();
    
    // Get number of days in previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    // Get today's date for highlighting
    const today = new Date();
    const currentDate = today.getDate();
    const currentMonthIndex = today.getMonth();
    const currentYearFull = today.getFullYear();
    
    // Previous month days
    for (let i = firstDayOfWeek; i > 0; i--) {
        const day = document.createElement('div');
        day.classList.add('calendar-day', 'other-month');
        
        const dayNumber = prevMonthLastDay - i + 1;
        
        // Calculate previous month and year
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }
        
        const dateString = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
        day.setAttribute('data-date', dateString);
        
        day.innerHTML = `<div class="calendar-day-number">${dayNumber}</div><div class="calendar-tasks"></div>`;
        
        // Add tasks for this date
        const tasksForDay = tasks.filter(task => task.dueDate === dateString);
        const tasksContainer = day.querySelector('.calendar-tasks');
        
        tasksForDay.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.classList.add('calendar-task', task.priority);
            taskEl.textContent = task.title;
            taskEl.setAttribute('data-id', task.id);
            
            taskEl.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditTaskModal(task.id);
            });
            
            tasksContainer.appendChild(taskEl);
        });
        
        day.addEventListener('click', () => {
            selectedDate = dateString;
            openTaskModal();
        });
        
        calendarDays.appendChild(day);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day');
        
        // Check if it's today
        if (i === currentDate && currentMonth === currentMonthIndex && currentYear === currentYearFull) {
            day.classList.add('today');
        }
        
        const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        day.setAttribute('data-date', dateString);
        
        day.innerHTML = `<div class="calendar-day-number">${i}</div><div class="calendar-tasks"></div>`;
        
        // Add tasks for this date
        const tasksForDay = tasks.filter(task => task.dueDate === dateString);
        const tasksContainer = day.querySelector('.calendar-tasks');
        
        tasksForDay.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.classList.add('calendar-task', task.priority);
            taskEl.textContent = task.title;
            taskEl.setAttribute('data-id', task.id);
            
            taskEl.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditTaskModal(task.id);
            });
            
            tasksContainer.appendChild(taskEl);
        });
        
        day.addEventListener('click', () => {
            selectedDate = dateString;
            openTaskModal();
        });
        
        calendarDays.appendChild(day);
    }
    
    // Next month days
    const totalDaysDisplayed = firstDayOfWeek + daysInMonth;
    const rowsNeeded = Math.ceil(totalDaysDisplayed / 7);
    const cellsNeeded = rowsNeeded * 7;
    const nextMonthDays = cellsNeeded - totalDaysDisplayed;
    
    for (let i = 1; i <= nextMonthDays; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day', 'other-month');
        
        // Calculate next month and year
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }
        
        const dateString = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        day.setAttribute('data-date', dateString);
        
        day.innerHTML = `<div class="calendar-day-number">${i}</div><div class="calendar-tasks"></div>`;
        
        // Add tasks for this date
        const tasksForDay = tasks.filter(task => task.dueDate === dateString);
        const tasksContainer = day.querySelector('.calendar-tasks');
        
        tasksForDay.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.classList.add('calendar-task', task.priority);
            taskEl.textContent = task.title;
            taskEl.setAttribute('data-id', task.id);
            
            taskEl.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditTaskModal(task.id);
            });
            
            tasksContainer.appendChild(taskEl);
        });
        
        day.addEventListener('click', () => {
            selectedDate = dateString;
            openTaskModal();
        });
        
        calendarDays.appendChild(day);
    }
}

function navigateMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    updateCalendarHeader();
    renderCalendarDays();
    
    showToast(`Viewing ${direction > 0 ? 'next' : 'previous'} month`, 'info');
}

function goToToday() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    
    updateCalendarHeader();
    renderCalendarDays();
    
    showToast('Viewing current month', 'info');
}

// Export tasks to JSON file
function exportTasks() {
    if (tasks.length === 0) {
        showToast('No tasks to export!', 'error');
        return;
    }
    
    const tasksJson = JSON.stringify(tasks, null, 2);
    const blob = new Blob([tasksJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Tasks exported successfully!', 'success');
}

// Import tasks from JSON file
function importTasks(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedTasks = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedTasks)) {
                throw new Error('Invalid format. Expected an array of tasks.');
            }
            
            // Validate task structure
            importedTasks.forEach(task => {
                if (!task.id || !task.title) {
                    throw new Error('Invalid task format. Each task must have at least an id and title.');
                }
            });
            
            // Find the highest task ID
            currentTaskId = Math.max(...importedTasks.map(task => task.id), 0);
            
            // Replace or merge tasks
            if (confirm('Do you want to replace all existing tasks? Click OK to replace, or Cancel to merge with existing tasks.')) {
                tasks = importedTasks;
            } else {
                // Merge tasks, avoiding duplicates by ID
                const existingIds = new Set(tasks.map(task => task.id));
                
                importedTasks.forEach(task => {
                    if (!existingIds.has(task.id)) {
                        tasks.push(task);
                    }
                });
            }
            
            // Save to localStorage
            saveTasks();
            
            // Refresh views
            if (currentView === 'tasks') {
                renderTasks();
            } else if (currentView === 'dashboard') {
                updateDashboard();
            } else if (currentView === 'calendar') {
                renderCalendarDays();
            }
            
            // Update analytics
            updateAnalytics();
            
            showToast('Tasks imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showToast(`Import failed: ${error.message}`, 'error');
        }
        
        // Reset file input
        e.target.value = '';
    };
    
    reader.readAsText(file);
}