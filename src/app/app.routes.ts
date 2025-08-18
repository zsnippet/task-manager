import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { LogoutComponent } from './pages/logout/logout';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', component: Login 
  },
  { path: 'logout', component: LogoutComponent 

  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks/new', 
    loadComponent: () => import('./pages/dashboard/task-form/task-form').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks/edit/:id', 
    loadComponent: () => import('./pages/dashboard/task-form/task-form').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];