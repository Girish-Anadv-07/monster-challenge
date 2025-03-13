import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  @Output() confirmed = new EventEmitter<boolean>();

  closeModal() {
    this.confirmed.emit(false); // User canceled
  }

  confirmLogout() {
    this.confirmed.emit(true); // User confirmed
  }
}
