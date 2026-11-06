import { InjectionToken } from '@angular/core';

export interface PortalEnvironment {
  readonly dataSource: 'mock' | 'http';
  readonly apiBaseUrl: string | null;
}

export const PORTAL_ENVIRONMENT = new InjectionToken<PortalEnvironment>('PortalEnvironment', {
  providedIn: 'root',
  factory: () => ({ dataSource: 'mock', apiBaseUrl: null }),
});
