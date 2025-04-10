import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card.component';
import { RestaurantsService } from '../services/restaurants.service';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { DatePipe } from '@angular/common';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../shared/modals/confirm-modal/confirm-modal.component';
import { Comment } from '../../interfaces/comment';

@Component({
  selector: 'restaurant-details',
  imports: [RouterLink, RestaurantCardComponent, StarRatingComponent, ReactiveFormsModule, ValidationClassesDirective, DatePipe, OlMapDirective, OlMarkerDirective],
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
  coordinates = signal<[number, number]>([0, 0]);
  #fb = inject(FormBuilder);
  #destroyRef = inject(DestroyRef);
  #modalService = inject(NgbModal);
  message = 'No hay Comentarios';
  commented = signal(false);

  getOpenDayNames(daysOpen: string[]) {
    return daysOpen.map((d) => this.days[+d]).join(', ');
  }

  restaurantResource = rxResource({
    request: () => this.id(),
    loader: ({ request: id }) =>
      this.#restaurantService.getById(id).pipe(
        tap((r) => {
          this.coordinates.set([r.lng, r.lat]);
          this.#title.setTitle(r.name + ' | FoodScore')
        }
        ),
        catchError(() => {
          this.#router.navigate(['/restaurants']);
          return EMPTY;
        })
      ),
  });

  commentsResource = rxResource({
    request: () => this.id(),
    loader: ({ request: id }) =>
      this.#restaurantService.getCommentById(id).pipe(
        catchError(() => {
          this.message = 'Error al cargar los comentarios';
          return EMPTY;
        })
      ),
  });

  commentForm = this.#fb.group({
    text: ['', [Validators.required, Validators.minLength(10)]],
    stars: [1, [Validators.required]],
  });

  addComment() {
    const newComment: Comment = {
      stars: this.commentForm.controls.stars.value!,
      text: this.commentForm.controls.text.value!,
    };
    this.#restaurantService
      .postComment(newComment, this.id())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.commentForm.reset();
          this.commentsResource.reload();
          this.commented.set(true);
        },
        error: () => {
          const modalRef = this.#modalService.open(ConfirmModalComponent);
          modalRef.componentInstance.title = 'Error al publicar comentario';
          modalRef.componentInstance.body = 'No se ha podido publicar el comentario, por favor inténtalo de nuevo';
        },
      });
  }

  changeRating(rating: number) {
    this.commentForm.controls.stars.setValue(rating);
  }
}
