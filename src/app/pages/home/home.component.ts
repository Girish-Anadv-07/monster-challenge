import { Component, AfterViewInit } from '@angular/core';
import ScrollReveal from 'scrollreveal';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../../login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, LoginComponent],
})
export class HomeComponent implements AfterViewInit {
  showLogin = false;
  isLoggedIn: boolean | null = null;

  ngAfterViewInit(): void {
    this.setupScrollReveal();
  }

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((state) => {
      this.isLoggedIn = state;
    });
  }

  constructor(
    private loginService: LoginService,
    private authService: AuthService
  ) {
    this.loginService.loginVisible$.subscribe((state) => {
      this.showLogin = state;
    });
  }

  toggleLogin(): void {
    this.loginService.toggleLogin();
  }

  closeLogin(): void {
    this.loginService.setLoginState(false);
  }

  setupScrollReveal(): void {
    ScrollReveal().reveal('.header__image img', {
      origin: 'right',
      distance: '100px',
      duration: 750,
      reset: true,
    });

    ScrollReveal().reveal('.header__content h1', {
      delay: 250,
      distance: '100px',
      origin: 'top',
    });

    ScrollReveal().reveal('.header__content p', {
      delay: 700,
      distance: '25px',
      origin: 'top',
    });

    ScrollReveal().reveal('.header__image__card', {
      duration: 500,
      interval: 250,
      delay: 250,
      distance: '50px',
      reset: true,
    });

    ScrollReveal().reveal('.header__image__card:nth-child(even)', {
      origin: 'bottom',
    });

    ScrollReveal().reveal('.header__image__card:nth-child(odd)', {
      origin: 'top',
    });

    ScrollReveal().reveal('.steps__card', {
      interval: 250,
      distance: '100px',
      duration: 700,
      reset: true,
    });

    ScrollReveal().reveal('.steps__card:nth-child(even)', {
      origin: 'bottom',
    });

    ScrollReveal().reveal('.steps__card:nth-child(odd)', {
      origin: 'top',
    });

    ScrollReveal().reveal('.explore__card', {
      duration: 1200,
      opacity: 0,
      scale: 0,
      easing: 'ease-out',
      afterReveal: (el: HTMLElement) => {
        el.style.transform = 'scale(1)';
      },
    });

    ScrollReveal().reveal('.testimony__card', {
      duration: 500,
      opacity: 0,
      scale: 0.5,
      easing: 'ease-in-out',
      reset: true,
    });

    ScrollReveal().reveal('.offer__card', {
      duration: 500,
      opacity: 0,
      scale: 0.95,
      distance: '20px',
      easing: 'ease-in-out',
      interval: 300,
      reset: true,
    });
  }
}
