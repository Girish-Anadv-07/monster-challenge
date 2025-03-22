import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  UserCredential,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedIn = new BehaviorSubject<boolean | null>(null);
  isLoggedIn$: Observable<boolean | null> = this.isLoggedIn.asObservable();

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.isLoggedIn.next(!!user);
    });
  }

  isAuthenticated(): Observable<boolean | null> {
    return this.isLoggedIn$;
  }

  getUserUID(): Promise<string> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user?.uid ?? '');
      });
    });
  }

  getUserName(): Promise<string> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user: User | null) => {
        resolve(user?.displayName ?? '');
      });
    });
  }

  getUserEmail(): Promise<string> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user?.email ?? '');
      });
    });
  }

  // Google Sign-In
  async googleSignIn() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Email/Password Sign-In
  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Register New User
  async register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Reset Password
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  // Logout
  async logout() {
    return signOut(this.auth);
  }
}
