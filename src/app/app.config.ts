import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'monster-cb72d',
        appId: '1:341987874823:web:8b4a318c98fc51e8dab2a2',
        storageBucket: 'monster-cb72d.firebasestorage.app',
        apiKey: 'AIzaSyDZRNhRihH_i1hJkOnw4ec9szAZhhPR5Ew',
        authDomain: 'monster-cb72d.firebaseapp.com',
        messagingSenderId: '341987874823',
      })
    ),
    provideAuth(() => getAuth()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
