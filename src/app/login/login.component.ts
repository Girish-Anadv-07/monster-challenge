import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  isRegistering = false;
  isReseting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  errorMessages: Record<string, string> = {
    'auth/claims-too-large': 'Custom claims payload exceeds the maximum size.',
    'auth/email-already-exists':
      'This email is already in use. Try logging in instead.',
    'auth/id-token-expired': 'Your session has expired. Please log in again.',
    'auth/id-token-revoked': 'Your session was revoked. Please log in again.',
    'auth/insufficient-permission':
      'You don’t have permission to perform this action.',
    'auth/internal-error':
      'An unexpected error occurred. Please try again later.',
    'auth/invalid-email': 'Invalid email format. Please enter a valid email.',
    'auth/invalid-password': 'Password must be at least six characters long.',
    'auth/invalid-uid': 'Invalid user ID format.',
    'auth/user-not-found': 'No user found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests':
      'Too many login attempts. Please try again later.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled for this project.',
    'auth/network-request-failed':
      'Network error. Check your internet connection.',
    'auth/unauthorized-continue-uri': 'Unauthorized request. Contact support.',
    'auth/phone-number-already-exists':
      'This phone number is already linked to another account.',
    'auth/uid-already-exists':
      'This user ID is already taken. Try a different one.',
    'auth/weak-password': 'The password is too weak.',
  };
  constructor(private authService: AuthService, private router: Router) {}

  toggleRegister() {
    this.isRegistering = true;
    this.isReseting = false;
    this.successMessage = null;
    this.errorMessage = null;
  }

  toggleLogin() {
    this.isRegistering = false;
    this.isReseting = false;
    this.successMessage = null;
    this.errorMessage = null;
  }

  toggleReset(event: Event) {
    event.preventDefault();
    this.isReseting = !this.isReseting;
    this.isRegistering = true;
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Login method
  login() {
    // Check if email or password is empty
    if (!this.password && !this.email) {
      this.errorMessage = 'Please enter your email & password.';
      return; // Stop further execution if password is empty
    }

    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return; // Stop further execution if email is empty
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password.';
      return; // Stop further execution if password is empty
    }

    // If both email and password are provided, proceed with login
    this.authService.login(this.email, this.password).then(
      () => {
        console.log('Login successful');
        this.router.navigate(['/flight-form']); // Redirect to flight form after login
      },
      (err) => {
        console.error('Login failed', err);

        // Display error message
        this.errorMessage =
          this.errorMessages[err.code] || 'Login failed. Please try again.';
      }
    );
  }

  // Password reset method
  resetPassword() {
    if (!this.email) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.authService
      .resetPassword(this.email)
      .then(() => {
        this.successMessage =
          'Password reset email sent. Please check your inbox.';
        this.errorMessage = null; // Clear any previous errors
      })
      .catch((err) => {
        console.error('Login failed', err);

        // Display error message
        this.errorMessage =
          this.errorMessages[err.code] || 'Login failed. Please try again.';
      });
  }

  // Google Sign-In method
  googleSignIn(event: Event) {
    event.preventDefault();
    this.authService.googleSignIn().then(
      () => {
        console.log('Google Sign-In successful');
        this.router.navigate(['/flight-form']); // Redirect to flight form after successful Google login
      },
      (err) => {
        console.error('Login failed', err);

        // Display error message
        this.errorMessage =
          this.errorMessages[err.code] || 'Login failed. Please try again.';
      }
    );
  }

  // Register method
  register() {
    // Check if email or password is empty
    if (!this.password && !this.email) {
      this.errorMessage = 'Please enter your email & password.';
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }
    this.authService.register(this.email, this.password).then(
      () => {
        console.log('User registered');
        this.router.navigate(['/flight-form']); // Redirect to flight form after registration
      },
      (err) => {
        console.error('Login failed', err);

        // Display error message
        this.errorMessage =
          this.errorMessages[err.code] || 'Login failed. Please try again.';
      }
    );
  }
}
