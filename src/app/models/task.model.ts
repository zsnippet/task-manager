export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: number;
}

export interface TaskFilters {
  status?: 'pending' | 'in-progress' | 'completed' | 'all';
  search?: string;
  sortBy?: 'dueDate' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  status: 'pending' | 'inProgress' | 'completed';
  dueDate?: Date;
}