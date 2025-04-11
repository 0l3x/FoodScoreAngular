import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';
import { CanComponentDeactivate } from '../../shared/guards/leave-page.guard';
import { RestaurantInsert } from '../../interfaces/restaurant';
import { RestaurantsService } from '../services/restaurants.service';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { OneCheckedDirective } from '../../shared/directives/one-checked.directive';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { SearchResult } from '../../shared/ol-maps/search-result';
import { GaAutocompleteDirective } from "../../shared/ol-maps/ga-autocomplete.directive";
import { catchError, EMPTY, tap } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ConfirmModalComponent } from '../../shared/modals/confirm-modal/confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'restaurant-form',
  imports: [FormsModule, EncodeBase64Directive, ValidationClassesDirective, ReactiveFormsModule, OlMapDirective, OlMarkerDirective, GaAutocompleteDirective],
  templateUrl: './restaurant-form.component.html',
  styleUrl: './restaurant-form.component.css',
})
export class RestaurantFormComponent implements CanComponentDeactivate {
  #restaurantService = inject(RestaurantsService);
  #destroyRef = inject(DestroyRef);
  #router = inject(Router);
  #fb = inject(NonNullableFormBuilder);
  restaurantForm = this.#fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$/)]],
    description: ['', [Validators.required]],
    cuisine: ['', [Validators.required]],
    image: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^([+0]?[0-9]{2} ?)?[0-9]{9}$/)]],
    daysOpen: this.#fb.array(new Array(7).fill(true), {
      validators: [OneCheckedDirective],
    }),
    lat: [0, [Validators.required]],
    lng: [0, [Validators.required]],
    address: ['', [Validators.required]],
  });
  readonly days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  imageBase64 = '';
  filename = '';
  saved = false;
  coordinates = signal<[number, number]>([0, 0]);
  id = input<number>();
  #title = inject(Title);
  postMode = signal(false);
  #modalService = inject(NgbModal);

  restaurantResource = rxResource({
    request: () => this.id(),
    loader: ({ request: id }) =>
      this.#restaurantService.getById(id).pipe(
        tap((r) => {
          this.coordinates.set([r.lng, r.lat]);
          this.#title.setTitle(r.name + ' | FoodScore');
        }),
        catchError(() => {
          this.#router.navigate(['/restaurants']);
          return EMPTY;
        })
      ),
  });

  constructor() {
    effect(() => {
      if (this.restaurantResource.value()) {
        this.restaurantForm.controls.name.setValue(
          this.restaurantResource.value()!.name
        );
        this.restaurantForm.controls.description.setValue(
          this.restaurantResource.value()!.description
        );
        this.restaurantForm.controls.cuisine.setValue(
          this.restaurantResource.value()!.cuisine
        );
        this.imageBase64 = this.restaurantResource.value()!.image;
        this.filename = this.restaurantResource.value()!.image.split('/').pop()!;
        this.restaurantForm.controls.phone.setValue(
          this.restaurantResource.value()!.phone.toString()
        );
        this.restaurantForm.controls.address.setValue(
          this.restaurantResource.value()!.address
        );
        this.restaurantForm.controls.lat.setValue(
          this.restaurantResource.value()!.lat
        );
        this.restaurantForm.controls.lng.setValue(
          this.restaurantResource.value()!.lng
        );
        this.restaurantForm.controls.daysOpen.setValue(
          new Array(7)
            .fill(false)
            .map((_, i) =>
              this.restaurantResource.value()!.daysOpen.includes(String(i))
            )
        );
        this.markPlace({
          address: this.restaurantResource.value()!.address,
          coordinates: [
            this.restaurantResource.value()!.lng,
            this.restaurantResource.value()!.lat,
          ],
        });
        this.postMode.set(false);
      } else {
        this.postMode.set(true);
      }
    });
  }

  addRestaurant() {
    const newRestaurant: RestaurantInsert = {
      ...this.restaurantForm.getRawValue(),
      image: this.imageBase64,
      daysOpen: this.days
        .map((d, i) => String(i))
        .filter((i) => this.restaurantForm.value.daysOpen?.[+i]),
      // address: '',
      // lat: 0,
      // lng: 0
      phone: this.restaurantForm.controls.phone.value.toString(),
    };

    if (this.restaurantResource.value()) { // para editar
      this.#restaurantService
        .putRestaurant(newRestaurant, this.restaurantResource.value()!.id)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: () => {
            this.saved = true;
            this.#router.navigate([
              '/restaurants',
              this.restaurantResource.value()!.id,
            ]);
          }
        });
    } else { // insert
      this.#restaurantService
        .insert(newRestaurant)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: (res) => {
            this.saved = true;
            this.#router.navigate(['/restaurants', res.id]);
          },
          error: (error) => console.log(error),
        });
    }
  }

  canDeactivate() {
    return (
      this.saved || this.restaurantForm.pristine ||
      this.confirmModal('¡Advertencia!', '¿Quieres abandonar la página? Los cambios no guardados se perderán...')
    );
  }

  confirmModal(title: string, body: string) {
    const modalRef = this.#modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.body = body;
    return modalRef.result.catch(() => false);
  }

  markPlace(result: SearchResult) {
    this.coordinates.set(result.coordinates);
    this.restaurantForm.controls.lat.setValue(result.coordinates[1]);
    this.restaurantForm.controls.lng.setValue(result.coordinates[0]);
    this.restaurantForm.controls.address.setValue(result.address);
  }
}