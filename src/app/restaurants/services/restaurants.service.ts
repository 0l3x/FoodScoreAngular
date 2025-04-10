import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommentsResponse, RestaurantsResponse, SingleCommentResponse, SingleRestaurantResponse } from '../../interfaces/responses';
import { map, Observable } from 'rxjs';
import { Restaurant, RestaurantInsert } from '../../interfaces/restaurant';
import { Comment } from '../../interfaces/comment';

@Injectable({
  providedIn: 'root',
})
export class RestaurantsService {
  #http = inject(HttpClient);

  getAll(search = '',
    page = 1,
    open = 0,
    creator?: string
  ): Observable<RestaurantsResponse>{
    let urlParams;
    if (creator) {
      urlParams = new URLSearchParams({
        search: search,
        page: page.toString(),
        open: open.toString(),
        creator: creator,
      });
    } else {
      urlParams = new URLSearchParams({
        search: search,
        page: page.toString(),
        open: open.toString(),
      });
    }
    return this.#http
      .get<RestaurantsResponse>(`restaurants?${urlParams}`)
      .pipe(map((r) => r));
  }

  getById(id: number) {
    return this.#http
      .get<SingleRestaurantResponse>(`restaurants/${id}`)
      .pipe(map((resp) => resp.restaurant));
  }

  insert(restaurant: RestaurantInsert): Observable<Restaurant> {
    return this.#http
      .post<SingleRestaurantResponse>('restaurants', restaurant)
      .pipe(map((resp) => resp.restaurant));
  }

  delete(id: number): Observable<void> {
    return this.#http.delete<void>(`restaurants/${id}`);
  }

  getCommentById(id: number): Observable<CommentsResponse> {
    return this.#http.get<CommentsResponse>(
      `restaurants/${id}/comments`
    );
  }

  postComment(comment: Comment, id: number): Observable<Comment> {
    return this.#http
      .post<SingleCommentResponse>(
        `restaurants/${id}/comments`,
        comment
      ).pipe(map((res) => res.comment));
  }
}
