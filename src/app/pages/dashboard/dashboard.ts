import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from './header/header';
import { StatsCardComponent } from './stat/statsCard';
import { TodoListComponent } from './todo-list/todo-list';

import { AuthService } from '../../services/auth';
import { TodoService } from '../../services/todo';
import { Todo, TaskStats } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, StatsCardComponent, TodoListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly todosApi = inject(TodoService);

  loading = signal<boolean>(true);
  error   = signal<string | null>(null);

  todos   = signal<Todo[]>([]);

  stats = computed<TaskStats>(() => {
    const items = this.todos();
    const total = items.length;
    const completed = items.filter(t => t.status === 'completed').length;
    const inProgress = items.filter(t => t.status === 'inProgress').length;
    const pending = items.filter(t => t.status === 'pending').length;
    return { total, completed, inProgress, pending };
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.error.set('Not authenticated');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // ✅ Load API todos
    this.todosApi.getTodosByUser(user.id).subscribe({
  next: (apiTodos) => {
    const localTodos = this.todosApi.getLocalTodos(user.id);

    // ✅ Normalize statuses (API + Local)
const normalizeTodo = (t: Todo): Todo => {
  let status: 'pending' | 'inProgress' | 'completed';

  switch (t.status?.toLowerCase()) {
    case 'done':
    case 'completed':
      status = 'completed';
      break;
    case 'inprogress':
    case 'in-progress':
    case 'in_progress':
      status = 'inProgress';
      break;
    default:
      status = 'pending';
  }

  // ✅ normalize dueDate
  let dueDate: Date | undefined = undefined;
  if (t.dueDate) {
    try {
      dueDate = new Date(t.dueDate as any);
    } catch {
      dueDate = undefined;
    }
  }

  return {
    ...t,
    status,   // ✅ now guaranteed to be valid
    dueDate
  };
};


    const normalizedApi = apiTodos.map(normalizeTodo);
    const normalizedLocal = localTodos.map(normalizeTodo);

    // ✅ Merge (local overrides API)
    const mergedMap: Record<string, Todo> = {};
    [...normalizedApi, ...normalizedLocal].forEach(todo => {
      mergedMap[todo.id.toString()] = todo;
    });

    this.todos.set(Object.values(mergedMap));
  },
  error: (err) => this.error.set(err?.message || 'Failed to load tasks'),
  complete: () => this.loading.set(false)
});

  }

  onTodoStatusChange(updatedTodo: Todo) {
    const current = this.todos();
    const index = current.findIndex(t => t.id === updatedTodo.id);
    if (index > -1) {
      current[index] = updatedTodo;
      this.todos.set([...current]); // trigger reactivity for stats

      // ✅ Save updated todo into local storage
      const user = this.auth.getCurrentUser();
      if (user) {
        this.todosApi.saveLocalTodos(user.id, current);
      }
    }
  }

  onTodoAdd(newTodo: Todo) {
    const current = this.todos();
    current.push(newTodo);
    this.todos.set([...current]);

    // ✅ Save new todo to local storage
    const user = this.auth.getCurrentUser();
    if (user) {
      this.todosApi.saveLocalTodos(user.id, current);
    }
  }
}