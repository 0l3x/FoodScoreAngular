import { Component, input, linkedSignal, model } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';
import { faStar as faStarFull } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'star-rating',
  imports: [FaIconComponent],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css',
})
export class StarRatingComponent {
  rating = model.required<number>();
  auxRating = linkedSignal(() => this.rating());
  modificar = input.required<boolean>();

  starEmpty = faStarEmpty;
  starFull = faStarFull;
}
