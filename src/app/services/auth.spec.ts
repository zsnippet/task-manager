import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', (done) => {
      const credentials: LoginCredentials = {
        username: 'demo',
        password: 'password'
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response.token).toBeTruthy();
          expect(response.user.username).toBe('demo');
          expect(response.user.name).toBe('Leanne Graham');
          expect(service.isAuthenticated()).toBe(true);
          expect(service.getCurrentUser()).toEqual(response.user);
          done();
        },
        error: done.fail
      });
    });

    it('should reject invalid credentials', (done) => {
      const credentials: LoginCredentials = {
        username: 'invalid',
        password: 'wrong'
      };

      service.login(credentials).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Invalid credentials');
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });
    });

    it('should reject valid username with wrong password', (done) => {
      const credentials: LoginCredentials = {
        username: 'demo',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Invalid credentials');
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });
    });

    it('should store token and user in localStorage on successful login', (done) => {
      const credentials: LoginCredentials = {
        username: 'admin',
        password: 'password'
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(localStorage.getItem('auth_token')).toBeTruthy();
          expect(localStorage.getItem('auth_user')).toBeTruthy();
          
          const storedUser = JSON.parse(localStorage.getItem('auth_user')!);
          expect(storedUser.username).toBe('admin');
          done();
        },
        error: done.fail
      });
    });
  });

  describe('logout', () => {
    beforeEach((done) => {
      // Login first
      const credentials: LoginCredentials = {
        username: 'demo',
        password: 'password'
      };

      service.login(credentials).subscribe({
        next: () => done(),
        error: done.fail
      });
    });

    it('should clear authentication state', () => {
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getCurrentUser()).toBeTruthy();

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBe(null);
      expect(localStorage.getItem('auth_token')).toBe(null);
      expect(localStorage.getItem('auth_user')).toBe(null);
    });
  });

  describe('token management', () => {
    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBe(null);
    });

    it('should return stored token', (done) => {
      const credentials: LoginCredentials = {
        username: 'demo',
        password: 'password'
      };

      service.login(credentials).subscribe({
        next: () => {
          const token = service.getToken();
          expect(token).toBeTruthy();
          expect(typeof token).toBe('string');
          done();
        },
        error: done.fail
      });
    });
  });

  describe('initialization', () => {
    it('should initialize auth state from localStorage', () => {
      // Manually set localStorage
      const mockUser = { id: 1, name: 'Test User', username: 'test', email: 'test@example.com' };
      const mockToken = 'mock.jwt.token';
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      // Create new service instance to test initialization
      const newService = new AuthService();
      
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getCurrentUser()).toEqual(mockUser);
      expect(newService.getToken()).toBe(mockToken);
    });

    it('should not be authenticated when localStorage is empty', () => {
      const newService = new AuthService();
      
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.getCurrentUser()).toBe(null);
      expect(newService.getToken()).toBe(null);
    });
  });

  describe('multiple users', () => {
    it('should authenticate different users', (done) => {
      const credentials: LoginCredentials = {
        username: 'user',
        password: 'password'
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response.user.username).toBe('user');
          expect(response.user.name).toBe('Clementine Bauch');
          expect(response.user.email).toBe('user@example.com');
          done();
        },
        error: done.fail
      });
    });
  });
});
