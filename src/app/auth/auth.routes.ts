import { leavePageGuard } from '../shared/guards/leave-page.guard';

export const authRoutes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    title: 'Login | FoodScore',
  },
  {
    path: 'register',
    canDeactivate: [leavePageGuard],
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
    title: 'Register | FoodScore',
  },
];