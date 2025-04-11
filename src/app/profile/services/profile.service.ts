import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User, UserPasswordEdit, UserPhotoEdit, UserProfileEdit } from '../../interfaces/user';
import { map, Observable } from 'rxjs';
import { SingleUserResponse } from '../../interfaces/responses';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  #profileUrl = 'users';
  #http = inject(HttpClient);

  getProfile(id?: number): Observable<User> {
    if (id) {
      return this.#http
        .get<SingleUserResponse>(`${this.#profileUrl}/${id}`)
        .pipe(map((r) => r.user));
    }
    return this.#http
      .get<SingleUserResponse>(`${this.#profileUrl}/me`)
      .pipe(map((r) => r.user));
  }

  putProfile(userProfile: UserProfileEdit): Observable<void> {
    return this.#http.put<void>(`${this.#profileUrl}/me`, userProfile);
  }

  putPasswordEdit(userPassword: UserPasswordEdit): Observable<void> {
    return this.#http.put<void>(
      `${this.#profileUrl}/me/password`,
      userPassword
    );
  }

  putPhotoEdit(userPhoto: UserPhotoEdit): Observable<void> {
    return this.#http.put<void>(`${this.#profileUrl}/me/avatar`, userPhoto);
  } 
}
