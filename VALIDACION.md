# Informe de integración y validación

## Alcance

- **Proyecto A:** se conservaron la portada y sus secciones, el encabezado, el formulario con su panel de marca, los iconos y el contenido local. El formulario mantiene los campos, el control para mostrar la contraseña y el diseño; ahora el envío abre el portal.
- **Proyecto B:** se integraron el contenedor, el tablero, los cursos actuales y pasados, las actividades del mes, pagos, el directorio y los detalles de actividades y maestros. Se conservaron los filtros, la paginación, el calendario, los submenús, las notificaciones y el comportamiento móvil.
- Se mantuvo el arranque del Proyecto A y se consolidaron ambos proyectos en Angular y CLI 20.3.35, TypeScript 5.9.3, RxJS 7.8.2 y un único lockfile. El empaquetado a medida de Proyecto B se sustituyó por Angular CLI. Tailwind se utiliza para generar los estilos aislados del portal.
- La portada, el login, el contenedor del portal y sus vistas tienen carga diferida. El estado del portal vive en una fachada con Signals y sus datos de demostración en un repositorio. La configuración de Router, HTTP, errores globales y futura API se explica en el README.

## Resultados de la integración inicial

| Verificación | Resultado |
| --- | --- |
| Instalación y compilación de producción AOT | Correctas, con `strict` y `strictTemplates` activos. El paquete inicial fue de 351,14 kB sin comprimir. |
| Pruebas unitarias | 2 de 2 pasaron: búsqueda, filtrado, paginación y estado vacío. |
| Pruebas Playwright en Chrome | 7 de 7 pasaron contra producción. Incluyen login vacío, navegación sin recargar la aplicación, recarga de un detalle, historial, rutas inexistentes y las interacciones del portal. |
| Recursos gráficos | 36 de 36 coincidieron por SHA-256 con los originales (3 de A y 33 de B). No se detectaron imágenes rotas en las seis capturas principales. |

Se compararon capturas de página completa en Chrome, con ventana de 900 px de alto y una vez cargados los datos y las fuentes. La referencia pública fue una compilación de Proyecto A; la referencia del portal fue la compilación original de Proyecto B, cuya carpeta de fuentes se verificó contra el ZIP.

| Vista | Ancho 1280 px | Ancho 390 px |
| --- | ---: | ---: |
| Portada | 0 píxeles distintos / 2 103 040 | 0 / 997 620 |
| Login | 0 / 1 152 000 | 0 / 352 950 |
| Tablero | 0 / 1 152 000 | 0 / 351 000 |

Además, se compararon ocho estados del portal a 1280 × 900. Cursos actuales, cursos pasados, detalle de actividad, lista mensual, calendario, pagos y detalle de maestro coincidieron píxel por píxel. En el directorio de maestros, 1 852 de 1 152 000 píxeles (0,16 %) difirieron; ningún canal cambió más de 16 niveles sobre 255. No se observaron imágenes rotas en estas capturas.

La coincidencia se limita a los estados capturados en Chrome. Los flujos de datos con un backend, la autenticación y los permisos reales quedan fuera del prototipo. La portada y el login conservan las fuentes originales servidas por Google Fonts, con sus alternativas de sistema para uso sin conexión.


## Navegación de regreso y diseño adaptable

El formulario incluye Volver al inicio. El logotipo y el botón Cerrar sesión de la cabecera del portal llevan a la portada. Las tarjetas del tablero se distribuyen según el ancho real de su panel.

La compilación de producción y las dos pruebas unitarias pasaron. Pasaron 13 pruebas en Chrome y 13 en WebKit. La matriz de navegación probó 320 × 568, 390 × 844, 667 × 375, 768 × 1024, 1024 × 768 y 1440 × 900. En cada tamaño se comprobaron los tres controles, el ancho de las páginas y que el indicador de pagos quedara dentro de su tarjeta. Se revisaron capturas de login y portal en 320, 768 y 1440 px.

Firefox se cerró antes de cargar la aplicación en este entorno. Las pruebas se ejecutaron con tamaños simulados.

## Preparación para GitHub Pages

`npm run build:pages` generó el sitio en `docs` con la ruta base `/circulo-de-brujas-prototipo/`. En Chrome se comprobó el recorrido de portada a login y portal, la carga de las imágenes y el acceso directo y la recarga de Pagos. La prueba usó un servidor local que sirve `404.html` para las rutas internas, como se ha configurado para Pages.
