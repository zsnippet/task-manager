import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Login } from './login';
import { AuthService } from '../../services/auth';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceMock: any;
  let routerMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    authServiceMock.isAuthenticated.and.returnValue(false);

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, Login],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate username field as required', () => {
    const username = component.loginForm.controls['username'];
    username.setValue('');
    expect(username.valid).toBeFalse();
    username.setValue('testuser');
    expect(username.valid).toBeTrue();
  });

  it('should validate password field as required', () => {
    const password = component.loginForm.controls['password'];
    password.setValue('');
    expect(password.valid).toBeFalse();
    password.setValue('password123');
    expect(password.valid).toBeTrue();
  });

  it('should populate demo credentials', () => {
    component.loadDemoCredentials();
    expect(component.loginForm.value).toEqual({
      username: 'emilys',
      password: 'emilyspass'
    });
  });

  it('should call AuthService.login on valid form submission', fakeAsync(() => {
    component.loginForm.setValue({ username: 'user', password: 'pass' });
    authServiceMock.login.and.returnValue(of({}));

    component.onSubmit();
    expect(component.isLoading).toBeTrue();
    tick();
    expect(authServiceMock.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
    expect(snackBarMock.open).toHaveBeenCalledWith('Login successful!', 'Close', { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith([component.returnUrl]);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle login error', fakeAsync(() => {
    component.loginForm.setValue({ username: 'user', password: 'pass' });
    const error = { message: 'Invalid credentials' };
    authServiceMock.login.and.returnValue(throwError(() => error));

    component.onSubmit();
    tick();
    expect(snackBarMock.open).toHaveBeenCalledWith(error.message, 'Close', { duration: 5000 });
    expect(component.isLoading).toBeFalse();
  }));
});