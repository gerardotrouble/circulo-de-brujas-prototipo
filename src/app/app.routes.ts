import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Casa Círculo de Brujas',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · Círculo de Brujas',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'portal-alumno',
    loadChildren: () => import('./features/portal-alumno/portal.routes').then(m => m.PORTAL_ROUTES),
  },
  { path: 'iniciar-sesion', pathMatch: 'full', redirectTo: 'login' },
  { path: 'alumno/inicio', pathMatch: 'full', redirectTo: 'portal-alumno' },
  {
    path: '**',
    title: 'Página no encontrada · Círculo de Brujas',
    loadComponent: () => import('./shared/not-found.component').then(m => m.NotFoundComponent),
  },
];
