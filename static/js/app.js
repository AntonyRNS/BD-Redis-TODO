// Aplicativo de Lista de Tarefas - JavaScript Principal
class TodoApp {
    constructor() {
        this.tasks = [];
        this.sortable = null;
        this.taskToDelete = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeTheme();
        this.initializeSortable();
        this.loadTasks();
    }
    
    // Inicializar elementos DOM
    initializeElements() {
        this.elements = {
            tasksList: document.getElementById('tasksList'),
            taskInput: document.getElementById('taskInput'),
            addTaskForm: document.getElementById('addTaskForm'),
            pendingCount: document.getElementById('pendingCount'),
            emptyState: document.getElementById('emptyState'),
            themeToggle: document.getElementById('themeToggle'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            toastContainer: document.getElementById('toastContainer'),
            confirmModal: document.getElementById('confirmModal'),
            modalTaskText: document.getElementById('modalTaskText'),
            modalConfirm: document.getElementById('modalConfirm'),
            modalCancel: document.getElementById('modalCancel'),
            modalClose: document.getElementById('modalClose')
        };
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Formulário de adicionar tarefa
        this.elements.addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // Toggle do tema
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Modal de confirmação
        this.elements.modalConfirm.addEventListener('click', () => {
            this.confirmDeleteTask();
        });
        
        this.elements.modalCancel.addEventListener('click', () => {
            this.hideModal();
        });
        
        this.elements.modalClose.addEventListener('click', () => {
            this.hideModal();
        });
        
        // Fechar modal clicando fora
        this.elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.elements.confirmModal) {
                this.hideModal();
            }
        });
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }
    
    // Inicializar tema
    initializeTheme() {
        const savedTheme = this.getCookie('theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    // Alternar tema
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    // Definir tema
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.setCookie('theme', theme, 365);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Inicializar funcionalidade drag and drop
    initializeSortable() {
        this.sortable = new Sortable(this.elements.tasksList, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                this.reorderTasks();
            }
        });
    }
    
    // Carregar tarefas
    async loadTasks() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/tasks');
            const data = await response.json();
            
            if (data.success) {
                this.tasks = data.tasks;
                this.renderTasks();
                this.updatePendingCount(data.pending_count);
                
                // Toast de informação com contagem de tarefas pendentes
                this.showToast('info', 'Informação', `${data.pending_count} tarefa(s) pendente(s)`);
            } else {
                this.showToast('error', 'Erro', 'Erro ao carregar tarefas');
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            this.showToast('error', 'Erro', 'Erro de comunicação com o servidor');
        } finally {
            this.hideLoading();
        }
    }
    
    // Adicionar nova tarefa
    async addTask() {
        const text = this.elements.taskInput.value.trim();
        
        if (!text) {
            this.showToast('warning', 'Atenção', 'Digite o texto da tarefa');
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.tasks.push(data.task);
                this.renderTasks();
                this.elements.taskInput.value = '';
                this.updatePendingCount();
                this.showToast('success', 'Sucesso', 'Tarefa adicionada com sucesso');
            } else {
                this.showToast('error', 'Erro', data.error || 'Erro ao adicionar tarefa');
            }
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            this.showToast('error', 'Erro', 'Erro de comunicação com o servidor');
        } finally {
            this.hideLoading();
        }
    }
    
    // Alternar status da tarefa
    async toggleTask(taskId) {
        try {
            this.showLoading();
            
            const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                method: 'PUT'
            });
            
            const data = await response.json();
            
            if (data.success) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    this.renderTasks();
                    this.updatePendingCount();
                }
            } else {
                this.showToast('error', 'Erro', data.error || 'Erro ao atualizar tarefa');
            }
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            this.showToast('error', 'Erro', 'Erro de comunicação com o servidor');
        } finally {
            this.hideLoading();
        }
    }
    
    // Preparar exclusão de tarefa (mostrar modal de confirmação)
    prepareDeleteTask(taskId, taskText) {
        this.taskToDelete = taskId;
        this.elements.modalTaskText.textContent = `"${taskText}"`;
        this.showModal();
        
        // Toast de warning
        this.showToast('warning', 'Atenção', 'Confirme a exclusão da tarefa');
    }
    
    // Confirmar exclusão de tarefa
    async confirmDeleteTask() {
        if (!this.taskToDelete) return;
        
        try {
            this.hideModal();
            this.showLoading();
            
            const response = await fetch(`/api/tasks/${this.taskToDelete}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);
                this.renderTasks();
                this.updatePendingCount();
                this.showToast('success', 'Sucesso', 'Tarefa removida com sucesso');
            } else {
                this.showToast('error', 'Erro', data.error || 'Erro ao remover tarefa');
            }
        } catch (error) {
            console.error('Erro ao remover tarefa:', error);
            this.showToast('error', 'Erro', 'Erro de comunicação com o servidor');
        } finally {
            this.taskToDelete = null;
            this.hideLoading();
        }
    }
    
    // Reordenar tarefas após drag and drop
    async reorderTasks() {
        const taskElements = this.elements.tasksList.querySelectorAll('.task-item');
        const taskIds = Array.from(taskElements).map(el => el.dataset.taskId);
        
        try {
            const response = await fetch('/api/tasks/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_ids: taskIds })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                this.showToast('error', 'Erro', 'Erro ao reordenar tarefas');
                this.loadTasks(); // Recarregar tarefas em caso de erro
            }
        } catch (error) {
            console.error('Erro ao reordenar tarefas:', error);
            this.showToast('error', 'Erro', 'Erro de comunicação com o servidor');
            this.loadTasks(); // Recarregar tarefas em caso de erro
        }
    }
    
    // Renderizar lista de tarefas
    renderTasks() {
        if (this.tasks.length === 0) {
            this.elements.tasksList.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            return;
        }
        
        this.elements.tasksList.style.display = 'flex';
        this.elements.emptyState.style.display = 'none';
        
        // Ordenar tarefas por ordem
        const sortedTasks = [...this.tasks].sort((a, b) => a.order - b.order);
        
        this.elements.tasksList.innerHTML = sortedTasks.map(task => this.createTaskHTML(task)).join('');
        
        // Adicionar event listeners aos elementos da tarefa
        this.elements.tasksList.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            
            // Checkbox
            const checkbox = item.querySelector('.task-checkbox');
            checkbox.addEventListener('click', () => this.toggleTask(taskId));
            
            // Botão de deletar
            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.prepareDeleteTask(taskId, task.text));
        });
    }
    
    // Criar HTML para uma tarefa
    createTaskHTML(task) {
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" title="Marcar como ${task.completed ? 'pendente' : 'concluída'}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-actions">
                    <button class="task-btn drag-handle" title="Arrastar para reordenar">
                        <i class="fas fa-grip-vertical"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Remover tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }
    
    // Atualizar contador de tarefas pendentes
    updatePendingCount(count = null) {
        if (count === null) {
            count = this.tasks.filter(task => !task.completed).length;
        }
        
        const countElement = this.elements.pendingCount.querySelector('.count-number');
        countElement.textContent = count;
    }
    
    // Mostrar toast notification
    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Event listener para fechar toast
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toast));
        
        this.elements.toastContainer.appendChild(toast);
        
        // Mostrar toast com animação
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remover após 5 segundos
        setTimeout(() => this.hideToast(toast), 5000);
    }
    
    // Esconder toast
    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    // Mostrar modal
    showModal() {
        this.elements.confirmModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Esconder modal
    hideModal() {
        this.elements.confirmModal.classList.remove('show');
        document.body.style.overflow = '';
        this.taskToDelete = null;
    }
    
    // Mostrar loading
    showLoading() {
        this.elements.loadingOverlay.classList.add('show');
    }
    
    // Esconder loading
    hideLoading() {
        this.elements.loadingOverlay.classList.remove('show');
    }
    
    // Utilitários para cookies
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}

// Inicializar aplicativo quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js').catch(() => {
            // Service worker não disponível
        });
    });
}