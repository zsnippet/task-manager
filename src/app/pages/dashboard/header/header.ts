import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService, User } from '../../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})

export class DashboardHeaderComponent implements OnInit {
  currentUser: User | null = null;
  dropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitial(name: string | undefined): string {
    return name ? name[0] : '';
  }

  // Close dropdown if clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }

  goToNewTask() {
    this.router.navigate(['/tasks/new']);
  }
}
