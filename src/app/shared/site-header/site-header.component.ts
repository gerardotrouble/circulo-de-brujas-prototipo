import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavLink } from '../../core/models/site.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cb-site-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  readonly nav = input<NavLink[]>([]);
  readonly siteName = input('Casa Círculo de Brujas');

  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
