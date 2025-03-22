import { Component, OnInit } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable, Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import {
  FirestoreService,
  FlightInfoPayload,
} from '../../services/firestore.service';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import ScrollReveal from 'scrollreveal';
import { DataService, Timezone } from '../../services/data.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { getDoc, doc } from 'firebase/firestore';

@Component({
  selector: 'app-flight-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './flight-form.component.html',
  styleUrls: ['./flight-form.component.css'],
})
export class FlightFormComponent implements OnInit {
  flightForm: FormGroup;

  airlines$!: Observable<string[]>;
  filteredAirlines$!: Observable<string[]>;
  filteredFlights$!: Observable<string[]>;
  timezones$!: Observable<Timezone[]>;
  filteredTimezones$!: Observable<Timezone[]>;
  selectedTimezone: Timezone | null = null;
  allFlightsForAirline: string[] = [];

  selectedAirline = '';
  successMessage = '';
  errorMessage = '';
  minDate: Date;
  flightId: string | null = null;

  loading: boolean | null = null;
  showLogoutModal = false;

  ngOnInit(): void {
    this.airlines$ = this.dataService.getAirlines();

    this.filteredAirlines$ = this.flightForm.get('airline')!.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this._filterAirlines(value))
    );

    this.flightForm.get('airline')?.valueChanges.subscribe((airline) => {
      this.dataService
        .getFlightsForAirline(airline || '')
        .subscribe((flights) => {
          this.allFlightsForAirline = flights;
        });
    });

    this.filteredFlights$ = this.flightForm
      .get('flightNumber')!
      .valueChanges.pipe(
        startWith(''),
        debounceTime(100),
        map((value) => this._filterFlights(value))
      );

    this.timezones$ = this.dataService.getTimezones();

    this.filteredTimezones$ = this.flightForm
      .get('timezone')!
      .valueChanges.pipe(
        startWith(''),
        switchMap((value) => this._filterTimezones(value))
      );

    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.flightId = params['id'];
        this.loadFlightData();
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollReveal();
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  syncToNextMinute() {
    const now = new Date();
    const millisecondsUntilNextMinute = (60 - now.getSeconds()) * 1000;

    setTimeout(() => {
      this.timeSubscription = this.dataService.getTimezones().subscribe();
    }, millisecondsUntilNextMinute);
  }

  private _filterTimezones(value: string): Observable<Timezone[]> {
    return this.timezones$.pipe(
      map((timezones) => {
        const filterValue = value.toLowerCase();
        return timezones.filter((tz) =>
          tz.name.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  private _filterAirlines(value: string): Observable<string[]> {
    return this.airlines$.pipe(
      map((airlines) => {
        const filterValue = value.toLowerCase();
        return airlines.filter((airline) =>
          airline.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  private _filterFlights(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allFlightsForAirline.filter((flight) =>
      flight.toLowerCase().includes(filterValue)
    );
  }

  private timeSubscription!: Subscription;

  private apiUrl =
    'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestore: Firestore,
    private http: HttpClient,
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {
    this.minDate = new Date();

    this.flightForm = this.fb.group({
      airline: ['', Validators.required],
      flightNumber: [{ value: '', disabled: true }, Validators.required],
      arrivalDate: [{ value: '', disabled: true }],
      arrivalTime: [{ value: '', disabled: true }],
      timezone: ['', Validators.required],
      numOfGuests: [
        1,
        [Validators.required, Validators.min(1), Validators.max(855)],
      ],
      comments: [''],
    });

    this.flightForm.get('airline')?.valueChanges.subscribe((value) => {
      if (value) {
        this.flightForm.get('flightNumber')?.enable();
      } else {
        this.flightForm.get('flightNumber')?.disable();
      }
    });

    this.initializeListeners();
  }

  onAirlineBlur() {
    setTimeout(() => {
      const airline = this.flightForm.get('airline')?.value;
      this.airlines$.pipe(take(1)).subscribe((airlines) => {
        if (!airlines.includes(airline)) {
          this.flightForm.get('airline')?.setValue('');
        }
      });
    }, 150);
  }

  onFlightNumberBlur() {
    setTimeout(() => {
      const airline = this.flightForm.get('airline')?.value;
      const flightNumber = this.flightForm.get('flightNumber')?.value;

      this.dataService
        .getFlightsForAirline(airline || '')
        .pipe(take(1))
        .subscribe((flights) => {
          const flightList = flights as string[];
          if (!flightList.includes(flightNumber)) {
            this.flightForm.get('flightNumber')?.setValue('');
          }
        });
    }, 400);
  }

  onTimezoneBlur() {
    setTimeout(() => {
      const timezone = this.flightForm.get('timezone')?.value;
      this.timezones$.pipe(take(1)).subscribe((timezones) => {
        const names = timezones.map((tz) => tz.name);
        if (!names.includes(timezone)) {
          this.flightForm.get('timezone')?.setValue('');
        }
      });
    }, 150);
  }

  initializeListeners(): void {
    this.flightForm
      .get('timezone')
      ?.valueChanges.pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((timezoneName: string) => {
        const iana = this.dataService.getIanaFromTimezoneName(timezoneName);
        if (iana) {
          this.selectedTimezone = { name: timezoneName, iana };
        }

        this.minDate = getDateObjectInTimezone(iana);

        this.updateArrivalDateValidators(iana);

        const currentArrivalDate = this.flightForm.get('arrivalDate')?.value;
        this.updateArrivalTimeValidators(currentArrivalDate);
      });

    this.flightForm
      .get('arrivalDate')
      ?.valueChanges.pipe(debounceTime(100))
      .subscribe((arrivalDate: Date) => {
        if (arrivalDate) {
          this.updateArrivalTimeValidators(arrivalDate);
          this.flightForm.get('arrivalDate')?.markAsTouched();
        }
      });
  }

  async loadFlightData() {
    if (this.flightId) {
      const flightRef = doc(
        this.firestore,
        `FlightInfoPayload/${this.flightId}`
      );
      const flightSnap = await getDoc(flightRef);

      if (!flightSnap.exists()) {
        this.errorMessage = 'Flight Details not found!';
        return;
      }

      const data = flightSnap.data();

      const dateStr = data['arrivalDate']; // e.g. "2025-03-23"
      const timeStr = data['arrivalTime']; // e.g. "14:30"

      let arrivalDate: Date | null = null;
      let arrivalTime: Date | null = null;

      if (dateStr && timeStr) {
        const fullDateTime = createLocalDateTime(dateStr, timeStr);

        // Extract separate date-only and time-only parts
        arrivalDate = new Date(
          fullDateTime.getFullYear(),
          fullDateTime.getMonth(),
          fullDateTime.getDate()
        );

        arrivalTime = new Date();
        arrivalTime.setHours(
          fullDateTime.getHours(),
          fullDateTime.getMinutes(),
          0,
          0
        );
      }

      this.flightForm.patchValue({
        ...data,
        arrivalDate,
        arrivalTime,
      });
      setTimeout(() => {
        this.flightForm.patchValue({
          arrivalTime: arrivalTime,
        });
      }, 1000);
    } else {
      this.errorMessage = 'Flight Details not found!';
    }
  }

  updateArrivalDateValidators(timeZone: string | undefined): void {
    const dateControl = this.flightForm.get('arrivalDate');
    if (timeZone) {
      dateControl?.enable();
      dateControl?.setValidators([
        Validators.required,
        futureDateValidator(timeZone),
      ]);
    } else {
      dateControl?.reset();
      dateControl?.disable();
    }
    dateControl?.updateValueAndValidity();
  }

  updateArrivalTimeValidators(arrivalDate: Date | null): void {
    const timeControl = this.flightForm.get('arrivalTime');
    const timeZone = this.selectedTimezone?.iana;

    if (arrivalDate && timeZone) {
      timeControl?.enable();
      timeControl?.setValidators([
        Validators.required,
        futureTimeValidator(arrivalDate, timeZone),
      ]);
    } else {
      timeControl?.reset();
      timeControl?.disable();
    }
    timeControl?.updateValueAndValidity();
  }

  handleTimezoneChange(selectedTimezone: Timezone) {
    this.selectedTimezone = selectedTimezone;
    this.flightForm.get('timezone')?.setValue(selectedTimezone.name);
    this.minDate = getDateObjectInTimezone(selectedTimezone.iana);
  }

  async submitForm() {
    if (!this.flightForm.valid) {
      this.errorMessage = 'Please fill all required fields!';
      return;
    }
    this.loading = true;

    const userUID = await this.authService.getUserUID();
    const userName = await this.authService.getUserName();
    const userEmail = await this.authService.getUserEmail();

    const rawFormValue = this.flightForm.value;

    const arrivalDateString =
      rawFormValue.arrivalDate instanceof Date
        ? new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(rawFormValue.arrivalDate)
        : rawFormValue.arrivalDate;

    const arrivalTimeString =
      rawFormValue.arrivalTime instanceof Date
        ? rawFormValue.arrivalTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : rawFormValue.arrivalTime;

    const flightInfoPayload: FlightInfoPayload = {
      ...rawFormValue,
      arrivalDate: arrivalDateString,
      arrivalTime: arrivalTimeString,
      uid: userUID,
      userName: userName || 'Unknown User',
      userEmail: userEmail || 'Unknown Email',
    };

    const headers = new HttpHeaders({
      token:
        'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
      candidate: userName,
    });

    this.http.post(this.apiUrl, flightInfoPayload, { headers }).subscribe({
      next: () => {
        if (this.flightId) {
          const flightRef = doc(
            this.firestore,
            `FlightInfoPayload/${this.flightId}`
          );
          updateDoc(flightRef, { ...flightInfoPayload });
          this.successMessage = 'Flight updated successfully!';
        } else {
          this.firestoreService.addFlightInfoPayload({ ...flightInfoPayload });
          this.successMessage = 'Flight information submitted successfully!';
        }

        this.flightForm.reset({
          airline: '',
          arrivalDate: '',
          arrivalTime: '',
          timezone: '',
          flightNumber: '',
          numOfGuests: 1,
          comments: '',
        });
      },
      error: (error) => {
        this.errorMessage =
          'Error submitting flight information: ' +
          (error.error?.message || error.message);
      },
      complete: () => {
        setTimeout(() => {
          this.loading = false;
        }, 100);
        this.router.navigate(['/travels']);
      },
    });
  }

  setupScrollReveal(): void {
    ScrollReveal().reveal('.header__image img', {
      distance: '100px',
      duration: 500,
      easing: 'ease-in-out',
      reset: true,
      beforeReveal: (el: HTMLElement) => {
        el.style.transform = 'translate(200px, -200px) scale(0.4)';
        el.style.opacity = '0';
      },
      afterReveal: (el: HTMLElement) => {
        el.style.transform = 'translate(0, 0) scale(1)';
        el.style.transition = 'transform 1s';
        el.style.opacity = '1';
      },
    });

    ScrollReveal().reveal('.header__image', {
      duration: 500,
      distance: '50px',
      origin: 'right',
      reset: true,
    });

    ScrollReveal().reveal('.form-container', {
      delay: 250,
      duration: 500,
      distance: '50px',
      origin: 'top',
      reset: true,
    });

    ScrollReveal().reveal('.header__image__card', {
      delay: 1200,
      duration: 500,
      interval: 150,
      distance: '50px',
      reset: true,
    });
  }
}

function futureDateValidator(timeZone: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const selectedDate = control.value.toISOString().split('T')[0];

    const today = new Date()
      .toLocaleString('en-CA', { timeZone })
      .split(',')[0];
    return selectedDate >= today ? null : { futureDate: true };
  };
}

function futureTimeValidator(arrivalDate: Date, timeZone: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const arrivalDateString = arrivalDate.toISOString().split('T')[0];
    const timeString = control.value.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const nowDate = new Date()
      .toLocaleString('en-CA', { timeZone })
      .split(',')[0];

    if (arrivalDateString > nowDate) return null;

    if (!timeString || timeString === 'Invalid Date') {
      return { invalidTime: true };
    }

    const nowTime = new Date()
      .toLocaleTimeString('en-GB', { timeZone, hour12: false })
      .slice(0, 5);

    return timeString > nowTime ? null : { futureTime: true };
  };
}

function getDateObjectInTimezone(iana: string | undefined): Date {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const year = Number(get('year'));
  const month = Number(get('month')) - 1;
  const day = Number(get('day'));
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const second = Number(get('second'));
  const date = new Date(year, month, day, hour, minute, second);

  return date;
}

function createLocalDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}
