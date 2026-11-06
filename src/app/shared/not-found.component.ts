import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ['main { padding: 48px var(--cb-gutter); } p { margin: 12px 0 24px; }'],
  template: `
    <main>
      <h1>Página no encontrada</h1>
      <p>La dirección que abriste no corresponde a una página disponible.</p>
      <a class="cb-btn" routerLink="/">Volver al inicio</a>
    </main>
  `,
})
export class NotFoundComponent {}
