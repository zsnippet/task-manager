import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ]
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  returnUrl = '/dashboard';
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginForm.disable();
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
          this.isLoading = false;
          this.loginForm.enable();
        },
        complete: () => {
          this.isLoading = false;
          this.loginForm.enable();
        }
      });
    }
  }

  loadDemoCredentials(): void {
    this.loginForm.patchValue({
      username: 'Elwyn.Skiles',
      password: 'password123'
    });
  }
}