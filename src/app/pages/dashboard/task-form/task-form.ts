// src/app/pages/dashboard/task-form/task-form.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TodoService } from '../../../services/todo';
import { AuthService } from '../../../services/auth';
import { Todo } from '../../../models/task.model';
import { of } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);
  private todoService = inject(TodoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  loading = signal(false);
  todoId?: number;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['pending', Validators.required],
      dueDate: [null, Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.todoId = +idParam;
      this.loadTodo(this.todoId);
    }
  }

  ngOnInit() {
  const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    this.todoId = +idParam;
    this.loadTodo(this.todoId);

    // Prevent editing completed task
    const user = this.auth.getCurrentUser();
    if (user) {
      const localTodos = this.todoService.getLocalTodos(user.id);
      const todo = localTodos.find(t => t.id === this.todoId);
      if (todo?.status === 'completed') {
        this.router.navigate(['/dashboard'], {
          queryParams: { error: 'completedTask' }
        });
      }
    }
  }
}

  loadTodo(id: number) {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    // merge API + local todos
    this.todoService.getTodosByUser(user.id).subscribe(apiTodos => {
      const localTodos = this.todoService.getLocalTodos(user.id);
      const allTodos = [...apiTodos];

      // Replace API todos with local edited ones
      localTodos.forEach(local => {
        const index = allTodos.findIndex(t => t.id === local.id);
        if (index > -1) {
          allTodos[index] = local;
        } else {
          allTodos.push(local); // add new local todos
        }
      });

      const todo = allTodos.find(t => t.id === id);
      if (todo) {
        this.form.patchValue({
          title: todo.title,
          description: todo.description || '',
          status: todo.status || 'pending',
          dueDate: todo.dueDate 
            ? new Date(todo.dueDate).toISOString().split('T')[0]
            : null
        });
      }
    });
  }

  submitted = false;
  onSubmit() {

    this.submitted = true;   // 👈 mark as submitted
    if (this.form.invalid) {
      // mark all fields as touched so errors show immediately
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    const user = this.auth.getCurrentUser();
    if (!user) return;

    const localTodos = this.todoService.getLocalTodos(user.id);

    if (!this.todoId) {
      // CREATE NEW TASK
      const newId = localTodos.length ? Math.max(...localTodos.map(t => t.id || 0)) + 1 : 1;
      const newTodo: Todo = {
        ...this.form.value,
        id: newId,
        userId: user.id,
        completed: this.form.value.status === 'completed'
      };
      localTodos.push(newTodo);
      this.todoService.saveLocalTodos(user.id, localTodos);

      this.snackBar.open('Task created!', 'Close', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    } else {
      // EDIT EXISTING TASK
      const index = localTodos.findIndex(t => t.id === this.todoId);
      if (index > -1) {
        localTodos[index] = {
          ...localTodos[index],
          ...this.form.value,
          completed: this.form.value.status === 'completed'
        };
      } else {
        // If the edited todo was only from API, add to local
        localTodos.push({
          ...this.form.value,
          id: this.todoId,
          userId: user.id,
          completed: this.form.value.status === 'completed'
        });
      }
      this.todoService.saveLocalTodos(user.id, localTodos);

      this.snackBar.open('Task updated!', 'Close', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}