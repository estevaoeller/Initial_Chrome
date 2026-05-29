export class TodoListManager {
  constructor() {
    this.inputEl = null;
    this.listEl = null;
    this.tasks = [];
  }

  init() {
    this.inputEl = document.getElementById('todo-input');
    this.listEl = document.getElementById('todo-list');

    if (!this.inputEl || !this.listEl) {
      console.warn('Elementos do To-Do List não encontrados no DOM.');
      return;
    }

    // Bind events
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.addTask();
      }
    });

    // Load existing tasks
    chrome.storage.sync.get(['todoList'], (result) => {
      this.tasks = result.todoList || [];
      this.render();
    });
  }

  addTask() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false,
    };

    this.tasks.push(newTask);
    this.inputEl.value = '';
    this.saveAndRender();
  }

  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveAndRender();
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveAndRender();
  }

  saveAndRender() {
    chrome.storage.sync.set({ todoList: this.tasks }, () => {
      this.render();
    });
  }

  render() {
    this.listEl.innerHTML = '';

    if (this.tasks.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'todo-empty';
      emptyEl.textContent = 'Nenhuma tarefa pendente. ☕';
      this.listEl.appendChild(emptyEl);
      return;
    }

    this.tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.ariaLabel = `Marcar tarefa "${task.text}" como concluída`;
      checkbox.addEventListener('change', () => this.toggleTask(task.id));

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'todo-delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.ariaLabel = `Excluir tarefa "${task.text}"`;
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      this.listEl.appendChild(li);
    });
  }
}
