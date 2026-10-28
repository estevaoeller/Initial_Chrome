export class TodoListManager {
  constructor() {
    this.inputEl = null;
    this.listEl = null;
    this.counterEl = null;
    this.clearCompletedBtn = null;
    this.tasks = [];
  }

  init() {
    this.inputEl = document.getElementById('todo-input');
    this.listEl = document.getElementById('todo-list');
    this.counterEl = document.getElementById('todo-counter');
    this.clearCompletedBtn = document.getElementById('todo-clear-completed');

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

    if (this.clearCompletedBtn) {
      this.clearCompletedBtn.addEventListener('click', () => {
        this.clearCompletedTasks();
      });
    }

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

  clearCompletedTasks() {
    const initialCount = this.tasks.length;
    this.tasks = this.tasks.filter((t) => !t.completed);
    if (this.tasks.length !== initialCount) {
      this.saveAndRender();
    }
  }

  saveAndRender() {
    chrome.storage.sync.set({ todoList: this.tasks }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Erro ao salvar tarefas no Chrome Sync:',
          chrome.runtime.lastError.message,
        );
        alert(
          'Atenção: Limite de armazenamento do Chrome Sync atingido. Limpe tarefas concluídas para liberar espaço.',
        );
      }
      this.render();
    });
  }

  render() {
    this.listEl.innerHTML = '';

    const pendingCount = this.tasks.filter((t) => !t.completed).length;
    const completedCount = this.tasks.length - pendingCount;

    // Atualizar contador
    if (this.counterEl) {
      if (this.tasks.length > 0) {
        this.counterEl.textContent = `(${pendingCount} pendente${pendingCount === 1 ? '' : 's'})`;
      } else {
        this.counterEl.textContent = '';
      }
    }

    // Exibir/ocultar botão de limpar concluídas
    if (this.clearCompletedBtn) {
      this.clearCompletedBtn.style.display =
        completedCount > 0 ? 'inline-flex' : 'none';
    }

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
