import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { SITE_ICONS, SiteContent } from '../models/site.models';
import siteContentMock from '../mocks/site-content.mock.json';

/**
 * Fuente de contenido del sitio público.
 *
 * PROTOTIPO: devuelve un JSON local con latencia simulada.
 * En una integración futura, sustituir la fuente local por un servicio HTTP.
 */
@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private readonly latencyMs = 450;

  getContent(): Observable<SiteContent> {
    const paths = siteContentMock.paths.map(path => {
      const icon = SITE_ICONS.find(value => value === path.icon);
      if (!icon) throw new Error('Icono desconocido en el contenido público: ' + path.icon);
      return { ...path, icon };
    });
    return of({ ...siteContentMock, paths }).pipe(delay(this.latencyMs));
  }
}
