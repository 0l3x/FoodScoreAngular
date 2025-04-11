import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faUser } from '@fortawesome/free-regular-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, EMPTY, tap } from 'rxjs';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';
import { ValidationClassesDirective } from '../../shared/directives/validation-classes.directive';
import { AlertModalComponent } from '../../shared/modals/alert-modal/alert-modal.component';
import { OlMapDirective } from '../../shared/ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../shared/ol-maps/ol-marker.directive';
import { sameValue } from '../../shared/validators/same-value.validator';
import { UserPasswordEdit, UserPhotoEdit, UserProfileEdit } from '../../interfaces/user';
import { ProfileService } from '../services/profile.service';
import { faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'profile-page',
  imports: [ RouterModule, EncodeBase64Directive, ValidationClassesDirective, ReactiveFormsModule, FaIconComponent, OlMapDirective, OlMarkerDirective ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent {
  #fb = inject(FormBuilder);
  #destroyRef = inject(DestroyRef);
  #modalService = inject(NgbModal);
  #profileService = inject(ProfileService);
  #title = inject(Title);
  #router = inject(Router);
  id = input<number | null>(null);
  editProfile = signal(false);
  editPassword = signal(false);
  coordinates = signal<[number, number]>([0, 0]);
  icon = { faEdit, faUser, faLock };
  imagen = signal('');
  imagenBase64 = '';

  profileResource = rxResource({
    loader: () =>
      this.#profileService.getProfile(this.id()!).pipe(
        tap((r) => {
          this.#title.setTitle(r.name + ' | FoodScore');
          this.coordinates.set([r.lng, r.lat]);
          this.imagen.set(r.avatar);
        }),
        catchError(() => {
          this.#router.navigate(['/restaurants']);
          return EMPTY;
        })
      ),
  });

  profileForm = this.#fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordControl = this.#fb.control('', {
    validators: [Validators.required],
  });

  passwordForm = this.#fb.group({
    password: this.passwordControl,
    passwordRep: ['', [sameValue(this.passwordControl)]],
  });

  constructor() {
    this.passwordControl.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.passwordForm.controls.passwordRep.updateValueAndValidity();
      });
  }

  putPassword() {
    const newPassword: UserPasswordEdit = {
      password: this.passwordForm.controls.password.value ?? '',
    };
    this.#profileService
      .putPasswordEdit(newPassword)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.openAlertModal(
            'Contraseña actualizada',
            'La contraseña ha sido actualizada correctamente'
          );
          this.passwordForm.reset();
          this.changeVisibilityPassword();
        },
        error: () => {
          this.openAlertModal(
            'Error al actualizar la contraseña',
            'Ha habido un error al actualizar la contraseña'
          );
        },
      });
  }

  putProfile() {
    const newProfile: UserProfileEdit = {
      name: this.profileForm.controls.name.value ?? '',
      email: this.profileForm.controls.email.value ?? '',
    };
    this.#profileService
      .putProfile(newProfile)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.openAlertModal(
            'Perfil actualizado',
            'El perfil ha sido actualizado correctamente'
          );
          this.profileForm.reset();
          this.changeVisibilityProfile();
          this.profileResource.reload();
        },
        error: () => {
          this.openAlertModal(
            'Error al actualizar el perfil',
            'Ha habido un error al actualizar el perfil'
          );
        },
      });
  }
  
  putImage(image: string) {
    const newAvatar: UserPhotoEdit = {
      avatar: image,
    };
    this.#profileService
      .putPhotoEdit(newAvatar)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.openAlertModal(
            'Avatar actualizado',
            'El avatar ha sido actualizado correctamente'
          );
          this.imagen.set(image);
        },
        error: () => {
          this.openAlertModal(
            'Error al actualizar el avatar',
            'Error en la actualización del avatar'
          );
        },
      });
  }

  openAlertModal(title: string, body: string) {
    const modalRef = this.#modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.body = body;
  }

  changeVisibilityProfile() {
    this.editProfile.update((e) => !e);
    this.profileForm.reset();
  }

  changeVisibilityPassword() {
    this.editPassword.update((e) => !e);
    this.passwordForm.reset();
  }
}