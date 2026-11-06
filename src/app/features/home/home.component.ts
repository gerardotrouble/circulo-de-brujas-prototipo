import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../core/services/site-content.service';
import { BrandPanelComponent } from '../../shared/brand-panel/brand-panel.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';

@Component({
  selector: 'cb-home',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, BrandPanelComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly content$ = inject(SiteContentService).getContent();

  /** null mientras carga (simulación de latencia de red). */
  protected readonly content = toSignal(this.content$, { initialValue: null });
  protected readonly skeletons = Array.from({ length: 8 });
}
