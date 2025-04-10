import { numericIdGuard } from '../shared/guards/numeric-id.guard';

export const profileRoutes = [
  {
    path: 'me',
    loadComponent: () =>
      import('./profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent
      ),
  },
  {
    path: ':id',
    canActivate: [numericIdGuard],
    loadComponent: () =>
      import('./profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent
      ),
  },
];
