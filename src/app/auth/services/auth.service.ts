import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User, UserLogin, UserLoginFb, UserLoginGoogle } from '../../interfaces/user';
import { SingleUserResponse, TokenResponse } from '../../interfaces/responses';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #authUrl = 'auth';
  #http = inject(HttpClient);
  #logged = signal(false);

  getLogged() {
    return this.#logged.asReadonly();
  }

  // Al hacer login, se envía la petición y se guarda el token en localStorage.
  login (data: UserLogin): Observable<void> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/login`, data).pipe(
      map((res) => {
        this.#logged.set(true);
        localStorage.setItem('token', res.accessToken);
        console.log('Token recibido:', res.accessToken);
      })
    );
  }

  // Para el logout, se elimina el token del localStorage y se actualiza el estado.
  logout() : void {
    this.#logged.set(false);
    localStorage.removeItem('token');
  }

  // Para comprobar si el usuario está logueado, se verifica si hay token.
  // Si existe, se valida con el servidor mediante un GET a /auth/validate.
  isLogged(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!this.#logged() && !token) {
      return of(false);
    } else if (!this.#logged() && token) {
      return this.#http.get<Observable<boolean>>(`${this.#authUrl}/validate`).pipe(
        map(() => {
          this.#logged.set(true);
          return true;
        }),
        catchError(() => {
          localStorage.removeItem('token');
          return of(false);
        })
      );
    }
    this.#logged.set(true);
    return of(true);
  }

  // Registro: envía datos de usuario al endpoint /auth/register y devuelve el usuario registrado.
  postRegister(user: User): Observable<User> {
    return this.#http
      .post<SingleUserResponse>(`${this.#authUrl}/register`, user)
      .pipe(map((res) => res.user));
  }

  // Login con Google: envía los datos, almacena el token y actualiza el estado.
  postLoginGoogle(user: UserLoginGoogle): Observable<TokenResponse> {
    return this.#http.post<TokenResponse>(`${this.#authUrl}/google`, user).pipe(
      map((res) => {
        this.#logged.set(true);
        localStorage.setItem('token', res.accessToken);
        return res;
      })
    );
  }

  // Login con Facebook: envía los datos, almacena el token y actualiza el estado.
  postLoginFacebook(user: UserLoginFb): Observable<TokenResponse> {
    return this.#http
      .post<TokenResponse>(`${this.#authUrl}/facebook`, user)
      .pipe(
        map((res) => {
          this.#logged.set(true);
          localStorage.setItem('token', res.accessToken);
          return res;
        })
      );
  }
}
