import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    title: 'Portal del Alumno · Círculo de Brujas',
    loadComponent: () => import('./student').then(m => m.Student),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./views/inicio').then(m => m.InicioView) },
      { path: 'cursos-actuales', loadComponent: () => import('./views/cursos-actuales').then(m => m.CursosActualesView) },
      { path: 'cursos-pasados', loadComponent: () => import('./views/cursos-pasados').then(m => m.CursosPasadosView) },
      { path: 'actividades-mes', loadComponent: () => import('./views/actividades-mes').then(m => m.ActividadesMesView) },
      { path: 'pagos', loadComponent: () => import('./views/pagos').then(m => m.PagosView) },
      { path: 'maestros', loadComponent: () => import('./views/maestros').then(m => m.MaestrosView) },
      { path: 'configuracion', title: 'Configuración · Portal del Alumno', loadComponent: () => import('./views/configuracion').then(m => m.ConfiguracionView) },
      ...(['cursos-actuales', 'cursos-pasados', 'actividades-mes'] as const).map(section => ({
        path: section + '/:id',
        loadComponent: () => import('./views/detalle-actividad').then(m => m.DetalleActividadView),
      })),
      { path: 'maestros/:id', loadComponent: () => import('./views/detalle-maestro').then(m => m.DetalleMaestroView) },
      { path: '**', redirectTo: '' },
    ],
  },
];
