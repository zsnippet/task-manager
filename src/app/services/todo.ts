import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Todo } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/todos'; // Example

  constructor(private http: HttpClient) {}

  // ---------------------------
  // API METHODS
  // ---------------------------

getTodosByUser(userId: number): Observable<Todo[]> {
  return this.http
    .get<Todo[]>(`${this.apiUrl}?userId=${userId}`)
    .pipe(
      map((todos: Todo[]) =>
        todos.map((t): Todo => {
          // Generate random due date (1 to 14 days from now)
          const daysToAdd = Math.floor(Math.random() * 14) + 1;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + daysToAdd);

          return {
            ...t,
            status: t.completed ? 'completed' : 'pending',
            dueDate,
          };
        })
      ),
      catchError(() => of([] as Todo[]))
    );
}



  // if later you want to post to backend too
  createTodo(todo: Todo): Observable<Todo> {
    return this.http
      .post<Todo>(this.apiUrl, todo)
      .pipe(catchError(() => of(todo))); // fallback
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http
      .put<Todo>(`${this.apiUrl}/${todo.id}`, todo)
      .pipe(catchError(() => of(todo)));
  }

  deleteTodo(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(() => of(void 0)));
  }

  // ---------------------------
  // LOCAL STORAGE HELPERS
  // ---------------------------

  private storageKey(userId: number): string {
    return `todos_${userId}`;
  }

  getLocalTodos(userId: number): Todo[] {
    const raw = localStorage.getItem(this.storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  }

  saveLocalTodos(userId: number, todos: Todo[]): void {
    localStorage.setItem(this.storageKey(userId), JSON.stringify(todos));
  }
}