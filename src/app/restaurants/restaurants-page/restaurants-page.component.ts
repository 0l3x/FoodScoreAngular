import { Component, computed, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../interfaces/restaurant';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card.component';
import { RestaurantsService } from '../services/restaurants.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProfileService } from '../../profile/services/profile.service';

@Component({
  selector: 'restaurants-page',
  imports: [FormsModule, RestaurantCardComponent],
  templateUrl: './restaurants-page.component.html',
  styleUrl: './restaurants-page.component.css',
})
export class RestaurantsPageComponent {
  #restaurantService = inject(RestaurantsService);
  #detroyRef = inject(DestroyRef);
  weekDay: number = new Date().getDay();
  restaurants = signal<Restaurant[]>([]);
  search = signal('');
  searchDebounce = toSignal(
    toObservable(this.search).pipe(debounceTime(600), distinctUntilChanged())
  );
  moreRestaurants = false;
  page = signal(1);
  open = signal(0);
  creator = input<string>();
  usuario = signal<string>('');
  #profileService = inject(ProfileService);
  filtrado = computed(() => {
    let filtrado = '';
    if (this.usuario()) {
      filtrado += ' Restaurantes creados por: ' + this.usuario() + '.';
    }
    if (this.search() !== '') {
      filtrado += ' Filtrados por: ' + this.search()+ '.';
    }
    return (filtrado +=
      this.open() === 1 ? ' Solo abiertos hoy' : ' Filtrado por: Todos');
  });

  constructor() {
    effect(() => {
      const busqueda = this.searchDebounce();
      untracked(() => {
        if (busqueda === this.search() && busqueda !== '') {
          this.page.set(1);
        }
      });
    });

    effect(() => {
      if (this.creator()) {
        this.#profileService
          .getProfile(Number(this.creator()))
          .pipe(takeUntilDestroyed(this.#detroyRef)) 
          .subscribe(res => this.usuario.set(res.name));
      } else {
        this.usuario.set('');
      }
  
      const restaurants = this.#restaurantService.getAll(
        this.searchDebounce(),
        this.page(),
        this.open(),
        this.creator() || undefined
      );
  
      restaurants
        .pipe(takeUntilDestroyed(this.#detroyRef))
        .subscribe(res => {
          this.restaurants.update(current => 
            this.page() === 1 ? res.restaurants : [...current, ...res.restaurants]
          );
          this.moreRestaurants = res.more;
          this.page.set(res.page);
        });
    });
  }

  loadMore() {
    this.page.update((page) => page + 1);
  }

  showOpen() {
    this.page.set(1);
    this.open.update((open) => (open === 0 ? 1 : 0));
  }

  deleteRestaurant(restaurant: Restaurant) {
    this.restaurants.update((restaurants) =>
      restaurants.filter((r) => r !== restaurant)
    );
  } 
}