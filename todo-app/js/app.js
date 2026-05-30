// Todo App - Local Storage Implementation
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.storageKey = 'todoAppTasks';
        
        this.initializeElements();
        this.loadTasks();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    attachEventListeners() {
        // 添加任务
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // 筛选按钮
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // 清除按钮
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    // 生成唯一ID
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // 添加任务
    addTask() {
        const text = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;

        if (text === '') {
            alert('请输入任务内容！');
            this.taskInput.focus();
            return;
        }

        const newTask = {
            id: this.generateId(),
            text: text,
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.render();
        this.taskInput.focus();
    }

    // 切换任务完成状态
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // 删除任务
    deleteTask(id) {
        if (confirm('确认删除此任务吗？')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    // 编辑任务
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const listItem = document.getElementById(`task-${id}`);
        const newText = prompt('编辑任务:', task.text);

        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
        }
    }

    // 清除已完成任务
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('没有已完成的任务！');
            return;
        }

        if (confirm(`确认删除 ${completedCount} 个已完成的任务吗？`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    // 清除所有任务
    clearAll() {
        if (this.tasks.length === 0) {
            alert('没有任务可以清除！');
            return;
        }

        if (confirm('确认删除所有任务吗？此操作不可撤销！')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    // 获取筛选后的任务
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'all':
            default:
                return this.tasks;
        }
    }

    // 更新统计信息
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }

    // 获取优先级显示文本
    getPriorityText(priority) {
        const priorityMap = {
            'high': '高优先级',
            'medium': '中优先级',
            'low': '低优先级'
        };
        return priorityMap[priority] || priority;
    }

    // 格式化时间
    formatTime(isoString) {
        const date = new Date(isoString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateStr = date.toLocaleDateString('zh-CN');
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

        if (dateStr === today.toLocaleDateString('zh-CN')) {
            return `今天 ${timeStr}`;
        } else if (dateStr === yesterday.toLocaleDateString('zh-CN')) {
            return `昨天 ${timeStr}`;
        } else {
            return `${dateStr} ${timeStr}`;
        }
    }

    // 渲染任务列表
    render() {
        const filteredTasks = this.getFilteredTasks();
        this.updateStats();

        // 清空列表
        this.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.taskList.classList.add('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');
        this.taskList.classList.remove('hidden');

        // 按优先级排序（高 > 中 > 低）
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        filteredTasks.sort((a, b) => {
            if (a.completed === b.completed) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.completed ? 1 : -1;
        });

        // 创建任务元素
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
            li.id = `task-${task.id}`;

            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="app.toggleTask('${task.id}')"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-time">${this.formatTime(task.createdAt)}</div>
                    <span class="priority-badge ${task.priority}">${this.getPriorityText(task.priority)}</span>
                </div>
                <div class="task-buttons">
                    <button class="edit-btn" onclick="app.editTask('${task.id}')">编辑</button>
                    <button class="delete-btn" onclick="app.deleteTask('${task.id}')">删除</button>
                </div>
            `;

            this.taskList.appendChild(li);
        });
    }

    // 转义HTML特殊字符
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 保存任务到本地存储
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('保存任务失败:', error);
            alert('保存任务失败，请检查浏览器存储空间！');
        }
    }

    // 从本地存储加载任务
    loadTasks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.tasks = JSON.parse(stored);
            }
        } catch (error) {
            console.error('加载任务失败:', error);
            this.tasks = [];
        }
    }

    // 导出任务为JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 导入任务从JSON
    importTasks(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.tasks = [...this.tasks, ...imported];
                this.saveTasks();
                this.render();
                alert('任务导入成功！');
            }
        } catch (error) {
            alert('导入失败，请检查JSON格式！');
        }
    }
}

// 初始化应用
const app = new TodoApp();

// 快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: 聚焦输入框
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        app.taskInput.focus();
    }
    // Ctrl/Cmd + S: 导出任务（作为演示）
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.log('当前任务:', app.tasks);
    }
});
