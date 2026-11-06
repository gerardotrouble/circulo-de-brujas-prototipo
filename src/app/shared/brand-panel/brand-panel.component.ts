import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Panel con la ilustración en trazo tenue, el logo y el lema. Se usa en el inicio y en el login. */
@Component({
  selector: 'cb-brand-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel__art" aria-hidden="true"></div>
    <div class="panel__content">
      <img class="panel__logo" src="assets/img/logo.png" alt="Círculo de Brujas by Erin Ahra" />
      <p class="panel__tagline">
        {{ lineOne() }}<br class="panel__br" />
        {{ lineTwo() }}
      </p>
      <ng-content />
    </div>
  `,
  styleUrl: './brand-panel.component.scss',
})
export class BrandPanelComponent {
  readonly lineOne = input('A nuestra casa,');
  readonly lineTwo = input('todas las brujas llegan solas.');
}
