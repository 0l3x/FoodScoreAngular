import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  RestaurantsResponse,
  SingleRestaurantResponse,
} from '../interfaces/responses';
import { map } from 'rxjs';
import { Restaurant } from '../interfaces/restaurant';

@Injectable({
  providedIn: 'root',
})
export class RestaurantsService {
  #http = inject(HttpClient);

  getAll() {
    return this.#http
      .get<RestaurantsResponse>('restaurants')
      .pipe(map((resp) => resp.restaurants));
  }

  getById(id: number) {
    return this.#http
      .get<SingleRestaurantResponse>(`restaurants/${id}`)
      .pipe(map((resp) => resp.restaurant));
  }

  insert(restaurant: Restaurant) {
    return this.#http
      .post<SingleRestaurantResponse>('restaurants', restaurant)
      .pipe(map((resp) => resp.restaurant));
  }

  delete(id: number) {
    return this.#http.delete<void>(`restaurants/${id}`);
  }
}
