import { afterRenderEffect, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GoogleLoginDirective } from '../google-login/google-login.directive';
import { FbLoginDirective } from '../facebook-login/fb-login.directive';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { MyGeolocation } from '../../shared/my-geolocation';
import { Coordinates } from '../../interfaces/coordinates';
import { UserLogin, UserLoginFb, UserLoginGoogle } from '../../interfaces/user';
import { AuthService } from '../services/auth.service';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';

@Component({
  selector: 'login',
  imports: [RouterLink, GoogleLoginDirective, FbLoginDirective, FaIconComponent, ReactiveFormsModule, ValidationClassesDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  #fb = inject(NonNullableFormBuilder);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #router = inject(Router);
  errorMessage = signal('');

  iconFacebook = faFacebook;

  loggedGoogle(resp: google.accounts.id.CredentialResponse) {
    const userLoginGoogle: UserLoginGoogle = {
      token: resp.credential,
      lat: this.loginForm.controls.lat.value,
      lng: this.loginForm.controls.lng.value,
    };
    this.#authService.postLoginGoogle(userLoginGoogle)
    .pipe(takeUntilDestroyed(this.#destroyRef))
    .subscribe({
      next: () => {
        this.#router.navigate(['/restaurants']);
      },
      error: (error) => {
        this.errorMessage.set("Datos incorrectos. Verifica tu email y contraseña.");
        console.log("Error de login: " + error.message);
      },
    });
  }

  loggedFacebook(resp: fb.StatusResponse) {
    const userLoginFacebook: UserLoginFb = {
      token: resp.authResponse.accessToken!,
      lat: this.loginForm.controls.lat.value,
      lng: this.loginForm.controls.lng.value,
    };
    this.#authService.postLoginFacebook(userLoginFacebook)
    .pipe(takeUntilDestroyed(this.#destroyRef))
    .subscribe({
      next: () => {
        this.#router.navigate(['/restaurants']);
      },
      error: (error) => {
        this.errorMessage.set("Datos incorrectos. Verifica tu email y contraseña.");
        console.log("Error de login: " + error.message);
      },
    });
  }

  showError(error: unknown) {
    console.error(error);
  }

  loginForm = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    lat: [0, Validators.required],
    lng: [0, Validators.required],
  });

  getActualCoordinates = toSignal(
    from(MyGeolocation.getLocation().then((coord) => coord))
  );
  
  constructor() {
    afterRenderEffect(async () => {
      const coords: Coordinates = {
        latitude: this.getActualCoordinates()?.latitude ?? 0,
        longitude: this.getActualCoordinates()?.longitude ?? 0,
      };

      this.loginForm.controls.lat.setValue(coords.latitude);
      this.loginForm.controls.lng.setValue(coords.longitude);
    });
  }  

  login() {
    const userLogin: UserLogin = {
      ...this.loginForm.getRawValue(),
      lat: this.loginForm.controls.lat.value,
      lng: this.loginForm.controls.lng.value,
    };
    this.#authService
      .login(userLogin)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.errorMessage.set('');
          this.#router.navigate(['/restaurants']);
        },
        error: (error) => {
          this.errorMessage.set("Datos incorrectos. Verifica tu email y contraseña.");
          console.log("Error de login: " + error.message);
        },
      });
  }

}