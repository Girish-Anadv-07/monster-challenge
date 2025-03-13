import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-flight-form',
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './flight-form.component.html',
  styleUrls: ['./flight-form.component.css'],
})
export class FlightFormComponent {
  flightForm: FormGroup;
  message = '';
  loading = false;
  showLogoutModal = false;

  private apiUrl =
    'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.flightForm = this.fb.group({
      airline: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      flightNumber: ['', Validators.required],
      numOfGuests: [1, [Validators.required, Validators.min(1)]],
      comments: [''],
    });
  }

  async submitForm() {
    if (this.flightForm.valid) {
      this.loading = true; // Start loading when the form is submitted

      const headers = new HttpHeaders({
        token:
          'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
        candidate: await this.authService.getUserName(),
      });

      this.http
        .post(this.apiUrl, this.flightForm.value, { headers })
        .subscribe({
          next: (response) => {
            console.log('Response:', response);
            this.message = 'Flight information submitted successfully!';
          },
          error: (error) => {
            console.error('Error:', error);
            this.message =
              'Error submitting flight information: ' +
              (error.error?.message || error.message);
          },
          complete: () => {
            console.log('Request completed.');
            this.loading = false; // Stop loading only after the request completes
          },
        });
    } else {
      this.message = 'Please fill all required fields!';
    }
  }

  logout() {
    this.showLogoutModal = true;
  }

  handleModalResponse(result: boolean) {
    if (result) {
      this.authService.logout().then(() => {
        console.log('Logged out');
        this.router.navigate(['/login']); // Redirect to login page
      });
    }
    this.showLogoutModal = false; // Hide modal
  }
}
