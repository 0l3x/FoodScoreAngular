import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Restaurant } from '../interfaces/restaurant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RestaurantsService } from '../services/restaurants.service';

@Component({
  selector: 'restaurant-card',
  imports: [RouterLink],
  templateUrl: './restaurant-card.component.html',
  styleUrl: './restaurant-card.component.css',
})
export class RestaurantCardComponent {
  #restaunrantService = inject(RestaurantsService);
  #destroyRef = inject(DestroyRef);
  weekDay: number = new Date().getDay();
  readonly days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  #router = inject(Router);
  restaurant = input.required<Restaurant>();
  deleted = output<void>();

  getOpenDayNames(daysOpen: string[]) {
    return daysOpen.map((d) => this.days[+d]).join(', ');
  }

  deleteRestaurant() {
    this.#restaunrantService
      .delete(this.restaurant().id!)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.#router.navigate(['/restaurants']);
        this.deleted.emit();
      });
  }
}
