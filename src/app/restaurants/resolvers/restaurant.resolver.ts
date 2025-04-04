import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { Restaurant } from '../interfaces/restaurant';
import { RestaurantsService } from '../services/restaurants.service';

export const restaurantResolver: ResolveFn<Restaurant> = (route) => {
  const restaurantService = inject(RestaurantsService);
  const router = inject(Router);
  return restaurantService.getById(+route.params['id']).pipe(
    catchError(() => {
      router.navigate(['/restaurants']);
      return EMPTY;
    })
  );
};
