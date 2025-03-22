import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginVisible = new BehaviorSubject<boolean>(false);
  loginVisible$ = this.loginVisible.asObservable();

  toggleLogin(): void {
    this.loginVisible.next(!this.loginVisible.value);
  }

  setLoginState(value: boolean): void {
    this.loginVisible.next(value);
  }
}
