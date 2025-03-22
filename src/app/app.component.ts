import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginService } from './services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, RouterModule],
})
export class AppComponent {
  title = 'monster';
  isLoggedIn: boolean | null = null;
  showDropdown = false;
  showLogin = false;
  dropdownTimeout: any;

  constructor(
    private authService: AuthService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginService.loginVisible$.subscribe((state) => {
      this.showLogin = state;
    });
  }

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((state) => {
      this.isLoggedIn = state;
    });
  }

  toggleLogin(): void {
    this.loginService.toggleLogin();
  }

  toggleDropdown(state: boolean): void {
    this.showDropdown = state;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showDropdown = false;
    this.router.navigate(['/']);
  }
}
