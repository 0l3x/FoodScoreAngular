import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Restaurant } from '../../interfaces/restaurant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RestaurantsService } from '../services/restaurants.service';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../shared/modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'restaurant-card',
  imports: [RouterLink, StarRatingComponent, FaIconComponent],
  templateUrl: './restaurant-card.component.html',
  styleUrl: './restaurant-card.component.css',
})
export class RestaurantCardComponent {
  #restaurantService = inject(RestaurantsService);
  #destroyRef = inject(DestroyRef);
  weekDay: number = new Date().getDay();
  readonly days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  #router = inject(Router);
  restaurant = input.required<Restaurant>();
  deleted = output<void>();
  #modalService = inject(NgbModal);
  creator = input<string>();
  icon = { faTrash, faPen };

  getOpenDayNames(daysOpen: string[]) {
    return daysOpen.map((d) => this.days[+d]).join(', ');
  }

  goEdit() {
    this.#router.navigate(['/restaurants', 'edit', this.restaurant().id!]);
  }

  deleteRestaurant() {
    this.#restaurantService
      .delete(this.restaurant().id!)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        if (this.creator()) {
          this.#router.navigate(['/restaurants'], {
            queryParams: { creator: this.creator() },
          });
        } else {
          this.#router.navigate(['/restaurants']);
        }
        this.deleted.emit();
      });
  }

  openDeleteModal() {
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Eliminar restaurante';
    modalRef.componentInstance.body =
      '¿Estás seguro de que quieres eliminar este restaurante?';
    modalRef.result.then((result) => {
      if (result === true) {
        this.deleteRestaurant();
      }
    });
  }
}