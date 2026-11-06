import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BrandPanelComponent } from '../../shared/brand-panel/brand-panel.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'cb-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BrandPanelComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: '',
    password: '',
    remember: true,
  });

  protected readonly showPassword = signal(false);
  protected readonly year = new Date().getFullYear();

  protected togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  protected submit(): void {
    // El prototipo permite entrar sin procesar ni almacenar credenciales.
    void this.router.navigate(['/portal-alumno']);
  }
}
