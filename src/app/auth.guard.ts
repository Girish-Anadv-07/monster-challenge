import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const isLoggedIn = await this.authService.isAuthenticated(); // Await the Promise

    if (isLoggedIn && state.url === '/login') {
      this.router.navigate(['/flight-form']);
      return false;
    }

    if (!isLoggedIn && state.url === '/flight-form') {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
