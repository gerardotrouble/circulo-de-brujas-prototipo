import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";

@Component({
  standalone: true,
  selector: "student-avatar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let source = photo();
    @if (source && failedPhoto() !== source) {
      <img [src]="source" alt="Foto de perfil" (error)="failedPhoto.set(source)" />
    } @else {
      <svg role="img" aria-label="Avatar predeterminado" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      </svg>
    }
  `,
  styles: [`
    :host { display: inline-grid; place-items: center; overflow: hidden; border-radius: 50%;
      background: rgb(var(--portal-slate-50, 242 234 242));
      color: var(--portal-accent-text, #6f516f); }
    img { width: 100%; height: 100%; object-fit: cover; }
    svg { width: 52%; height: 52%; }
  `],
})
export class StudentAvatar {
  readonly photo = input.required<string | null>();
  protected readonly failedPhoto = signal<string | null>(null);
}
