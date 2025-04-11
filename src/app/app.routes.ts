import { Routes } from '@angular/router';
import { loginActivateGuard } from './shared/guards/login-activate.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'restaurants',
    loadChildren: () =>
      import('./restaurants/restaurant.routes').then(
        (m) => m.restaurantsRoutes
      ),
  },
  {
    path: 'profile',
    canActivate: [loginActivateGuard],
    loadChildren: () =>
      import('./profile/profile.routes').then((m) => m.profileRoutes),
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];