import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card.component';
import { RestaurantsService } from '../services/restaurants.service';

@Component({
  selector: 'restaurant-details',
  imports: [RouterLink, RestaurantCardComponent],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css',
})
export class RestaurantDetailsComponent {
  id = input.required<number>();
  #restaurantService = inject(RestaurantsService);
  weekDay: number = new Date().getDay();
  readonly days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  #title = inject(Title);
  #router = inject(Router);

  restaurantResource = rxResource({
    request: () => this.id(),
    loader: ({ request: id }) =>
      this.#restaurantService.getById(id).pipe(
        tap((r) => this.#title.setTitle(r.name + ' | FoodScore')),
        catchError(() => {
          this.#router.navigate(['/restaurants']);
          return EMPTY;
        })
      ),
  });

  getOpenDayNames(daysOpen: string[]) {
    return daysOpen.map((d) => this.days[+d]).join(', ');
  }
}
