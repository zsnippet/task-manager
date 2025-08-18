// src/app/pages/dashboard/todo-list/todo-list.ts
import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../../models/task.model';
import { Router } from '@angular/router';

type ViewFilter = 'all' | 'completed' | 'pending' | 'inProgress';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css'] // corrected
})
export class TodoListComponent {

  private readonly router = inject(Router); // corrected

  @Input() set todos(value: Todo[]) {
    this._todos.set(Array.isArray(value) ? value : []);
  }

  @Output() statusChange = new EventEmitter<Todo>();

  private _todos = signal<Todo[]>([]);
  view = signal<ViewFilter>('all');
  query = signal<string>('');
  sortOrder = signal<SortOrder>('asc');

  filtered = computed<Todo[]>(() => {
    const q = this.query().trim().toLowerCase();
    const v = this.view();
    return this._todos()
      .filter(t => {
        if (v === 'completed') return t.status === 'completed';
        if (v === 'pending') return t.status === 'pending';
        if (v === 'inProgress') return t.status === 'inProgress';
        return true;
      })
      .filter(t => (q ? t.title.toLowerCase().includes(q) : true));
  });

  sortedTodos = computed<Todo[]>(() => {
    const todos = this.filtered();
    const order = this.sortOrder();
    return [...todos].sort((a, b) => {
      const aTime = a.dueDate?.getTime() || 0;
      const bTime = b.dueDate?.getTime() || 0;
      return order === 'asc' ? aTime - bTime : bTime - aTime;
    });
  });

  trackById(_: number, t: Todo) {
    return t.id;
  }

  setView(v: ViewFilter) {
    this.view.set(v);
  }

  changeStatus(todo: Todo, newStatus: 'pending' | 'inProgress' | 'completed') {
    const todos = this._todos();
    const index = todos.findIndex(t => t.id === todo.id);
    if (index > -1) {
      todos[index] = { ...todos[index], status: newStatus };
      this._todos.set([...todos]);
      this.statusChange.emit(todos[index]);
    }
  }

  editTask(id: number) {
    this.router.navigate(['/tasks/edit', id]);
  }
}