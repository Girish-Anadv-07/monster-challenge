import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import ScrollReveal from 'scrollreveal';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  query,
  where,
  deleteDoc,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AdminPanelComponent implements OnInit {
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  sortedColumn: string = '';
  sortAscending: boolean = true;
  flights: any[] = [];
  filteredFlights: any[] = [];
  loading = true;
  uid = '';

  constructor(
    private firestore: Firestore,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.uid = await this.authService.getUserUID();

    this.fetchFlights();
  }

  ngAfterViewInit(): void {
    ScrollReveal().reveal('.table__header, .pagination', {
      duration: 1000,
      opacity: 0,
      scale: 0.5,
      easing: 'ease-in-out',
    });
  }

  fetchFlights() {
    const flightsCollection = collection(this.firestore, 'FlightInfoPayload');
    const q = query(flightsCollection, where('uid', '==', this.uid));
    collectionData(q, { idField: 'id' }).subscribe({
      next: (flights) => {
        this.flights = flights;
        this.filteredFlights = [...flights];
        this.loading = false;
      },
      error: (error) => {
        console.error('Firestore Read Error:', error);
        this.loading = false;
      },
    });
  }

  get paginatedFlights() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFlights.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.max(
      Math.ceil(this.filteredFlights.length / this.itemsPerPage),
      1
    );
  }

  editFlight(flight: any) {
    this.router.navigate(['/flight-form'], { queryParams: { id: flight.id } });
  }

  async deleteFlight(flightId: string) {
    if (confirm('Are you sure you want to delete this vacation?')) {
      const flightRef = doc(this.firestore, `FlightInfoPayload/${flightId}`);
      await deleteDoc(flightRef);
      this.fetchFlights();
    }
  }

  sortTable(column: string) {
    this.sortAscending =
      this.sortedColumn === column ? !this.sortAscending : true;
    this.sortedColumn = column;

    this.filteredFlights.sort((a: any, b: any) => {
      return this.sortAscending
        ? a[column] > b[column]
          ? 1
          : -1
        : a[column] < b[column]
        ? 1
        : -1;
    });
  }

  filterData() {
    this.filteredFlights = this.flights.filter((item) =>
      Object.values(item).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          value.toString().toLowerCase().includes(this.searchText.toLowerCase())
      )
    );
    this.currentPage = 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  navigateToFlightForm() {
    this.router.navigate(['/flight-form']);
  }
}
