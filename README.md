# CirculoDeBrujas-Prototipo

Aplicación Angular de Casa Círculo de Brujas. Reúne la página pública, el formulario de ingreso y el Portal del Alumno en una sola aplicación.

## Publicar en GitHub Pages

1. Sube esta copia a la rama `main` de un repositorio de GitHub. La carpeta `docs` incluye la versión lista para publicar.
2. En el repositorio, abre **Settings → Pages**. Elige **Deploy from a branch**, selecciona `main` y `/docs`, y guarda.
3. Cuando termine el despliegue, abre el enlace que aparece en **Settings → Pages**.

Después de editar el proyecto, regenera `docs` con `npm ci` y `npm run build:pages` y sube los cambios. Las rutas internas de esta compilación usan `#/`, por ejemplo `#/portal-alumno/pagos`. Esto permite compartirlas y recargarlas en GitHub Pages.

La publicación incluye la portada y el Portal del Alumno de demostración, que tiene acceso abierto.

## Ejecutar

Requisitos: Node.js 22.12 o posterior dentro de la rama 22, o Node.js 24, y npm. El proyecto utiliza Angular y Angular CLI 20.3.35, TypeScript 5.9.3, RxJS 7.8 y Tailwind CSS 3.4 para el portal.

```bash
npm ci
npm start
```

Abre http://localhost:4200. También puedes ejecutar `npm run ng -- serve`. Para compilar en producción:

```bash
npm run build
```

Los archivos se generan en `dist/circulo-de-brujas-prototipo/browser`. Configura el servidor para servir `index.html` en las rutas de Angular que no correspondan a archivos estáticos. Así funcionan el acceso directo y la recarga en las vistas internas.

## Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Página pública |
| `/login` | Formulario de ingreso |
| `/portal-alumno` | Inicio y tablero |
| `/portal-alumno/cursos-actuales`, `/portal-alumno/cursos-pasados` | Catálogos de cursos |
| `/portal-alumno/actividades-mes` | Actividades del mes y calendario |
| `/portal-alumno/pagos` | Pagos e historial |
| `/portal-alumno/maestros` | Directorio |
| `/portal-alumno/{cursos-actuales,cursos-pasados,actividades-mes}/:id` | Detalle de una actividad de la sección correspondiente |
| `/portal-alumno/maestros/:id` | Perfil de maestro |

Las direcciones anteriores `/iniciar-sesion` y `/alumno/inicio` redirigen a sus equivalentes. Una dirección desconocida fuera del portal muestra la página no encontrada; una sección desconocida dentro del portal vuelve a su inicio.

En la portada, pulsa **Iniciar sesión** y después **Entrar**. El formulario mantiene el diseño original y permite entrar incluso con ambos campos vacíos. El portal es de acceso abierto durante el prototipo. No se verifica, envía ni persiste lo que se escriba en los campos. Puedes volver a la portada desde el enlace del formulario, el logotipo del portal o el botón Cerrar sesión.

## Arquitectura

- `src/main.ts` arranca Angular una vez. `app.config.ts` configura Router, HTTP y el manejo global de errores. `app.routes.ts` carga por separado la portada, el login y el portal.
- `features/home` y `features/login` contienen las vistas de Proyecto A. `shared` reúne el encabezado, el panel de marca, los iconos y las ilustraciones reutilizadas.
- `features/portal-alumno` contiene el contenedor y las ocho vistas originales. `portal.routes.ts` carga cada vista bajo el mismo contenedor, con URLs para listas y detalles. La URL determina la sección y el elemento seleccionado.
- `StudentFacade` conserva el estado de interfaz con Signals y calcula filtros, selecciones y paginación con `computed()`. RxJS se usa para la lectura de datos y los eventos del Router; las suscripciones terminan al salir del portal.
- `core` contiene configuración, servicios transversales y el contenido local de la página pública. El portal tiene modelos de dominio, repositorio y datos de demostración separados.
- `src/styles/public.scss` conserva la hoja pública. `portal.source.css` conserva la fuente Tailwind del portal y `portal.css` contiene la versión compilada y aislada. El selector del contenedor habilita los estilos correspondientes, incluido el reset, al entrar o salir del portal. Si cambias clases Tailwind o la hoja fuente, ejecuta `npm run styles:portal` y conserva el CSS generado. `src/assets` conserva los recursos de ambos proyectos.

## Integración futura con backend

El portal usa `STUDENT_REPOSITORY` y el repositorio local por defecto. Para conectar una API real, configura `PORTAL_ENVIRONMENT` con la URL base y la fuente HTTP, y provee `STUDENT_API` con la ruta del contrato acordado y un decodificador de la respuesta a `StudentData`. El interceptor convierte errores HTTP en `ApiError` y conserva la causa para depuración. El portal muestra un aviso si no se pueden cargar sus datos.

Cuando haya un contrato de autenticación, reemplaza la navegación directa del formulario por una llamada al servicio de sesión, configura la protección en la ruta padre del portal y agrega interceptores solo si el contrato los requiere. El flujo actual no define endpoints ni genera sesiones simuladas.

## Pruebas

```bash
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

El comando inicia un servidor local temporal para probar la compilación de producción. Para usar Chrome ya instalado, define `PLAYWRIGHT_CHANNEL=chrome`. Para probar un servidor ya en marcha, define `PORTAL_E2E_URL` con su URL. Las pruebas cubren el recorrido con el formulario vacío, navegación sin recarga, acceso directo, recarga de rutas internas y las interacciones originales del portal.


Consulta [VALIDACION.md](VALIDACION.md) para ver los resultados de compilación, pruebas y comparación visual.
