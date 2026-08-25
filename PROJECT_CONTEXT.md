# Contexto del proyecto Promptylandia

Este documento consolida el contexto histórico del proyecto y su estado tras la migración de macOS a Windows 11. El repositorio Git y su historial son la fuente de verdad para el código.

## Estado actual

- Repositorio: `https://github.com/ricardojosealvarez/Promptylandia`
- Rama principal: `main`
- Commit validado: `c94f53450c74700d6e73e277b8f550af218f4b45`
- Mensaje del commit: `fix(import): activate Excel file picker`
- Versión visible: `v1.17.1`
- Ruta local canónica en Windows: `C:\Users\anita\Proyectos\Promptylandia`
- Frontend: SPA estática en `index.html` con HTML, CSS y JavaScript vanilla.
- Backend: Supabase Auth, Postgres, REST y Edge Functions.
- Publicación web: GitHub Pages mediante `.github/workflows/deploy.yml`.
- Escrituras y administración: Edge Function `prompts-proxy`.

La copia local de Windows fue clonada desde GitHub, quedó en la rama `main`, con árbol de trabajo limpio y remoto `origin` validado.

## Restauración y respaldo

El respaldo `Promptylandia.zip` de Google Drive fue comparado con el commit actual.

Resultado de la comparación:

- Los 22 archivos versionados del ZIP coinciden con GitHub.
- No se detectaron cambios locales de código pendientes.
- El ZIP incluía metadatos y residuos que no deben restaurarse: `.git`, `.DS_Store`, `supabase/.DS_Store` y `__MACOSX`.
- El único archivo útil no versionado era la versión histórica de este documento.

Por tanto, GitHub es la fuente canónica del proyecto y el ZIP queda como respaldo histórico, no como base de trabajo.

## Funcionalidad consolidada

- Autenticación con Supabase.
- Acceso restringido a usuarios aprobados.
- Operaciones administrativas protegidas mediante `prompts-proxy`.
- Búsquedas paginadas contra el servidor.
- Categoría `TODAS IA` renombrada a `Multiples`.
- Campo booleano `premium` en la base de datos.
- Edición e importación Excel compatibles con `PREMIUM`.
- Badge `Premium` en resultados.
- Filtro de usuario `Solo Premium`.
- Badge `Nuevo` para prompts creados o actualizados recientemente.
- Filtro combinable `Solo novedades`.
- Contador de altas recientes.
- Historial de versiones visible en la interfaz.
- Botón real de importación Excel compatible entre navegadores.
- Importación Excel con altas y actualizaciones mediante `ACCION`, `NOMBRE_ANTIGUO` y `NOMBRE_NUEVO`.
- Novedad Premium aleatoria al acceder a la página principal de búsqueda.
- Prompt Premium aleatorio como alternativa cuando no hay novedades recientes.
- Bloqueo inmediato de la interfaz y regreso al acceso cuando expira la sesión.
- Propuestas de prompts de usuarios aprobados con nombre público de contribuidor.
- Extracción administrativa de propuestas a Excel con borrado atómico de la cola.
- Importación y visualización del campo opcional `CONTRIBUIDOR`.

## Evolución principal

- PR #4: renombrado de `TODAS IA` a `Multiples`.
- PR #5: paginación de búsquedas respaldada por servidor.
- PR #6: corrección de controles de paginación.
- PR #7: soporte completo de prompts Premium, versión `v1.9.0`.
- PR #8: filtro `Solo Premium`, versión `v1.9.1`.
- PR #9: novedades de los últimos 14 días, versión `v1.10.0`.
- `v1.10.1`: corrección de búsquedas por nombre con caracteres especiales de PostgREST.
- `v1.11.0`: distintivos y filtro para prompts actualizados recientemente.
- `v1.12.0`: historial de versiones con fecha de implantación.
- `v1.12.1`: corrección del botón `Importar Excel` para activar el selector de archivos de forma compatible entre navegadores.
- `v1.13.0`: soporte de altas y actualizaciones desde Excel.
- `v1.14.0`: novedad destacada Premium aleatoria en la página de búsqueda.
- `v1.14.1`: Prompt Destacado Premium cuando no existen novedades recientes.
- `v1.14.2`: corrección de la selección aleatoria de novedades y prompts destacados.
- `v1.14.3`: corrección de caché del selector de novedades destacadas.
- `v1.15.0`: control automático de expiración de sesión.
- `v1.16.0`: propuestas de usuarios, exportación administrativa y créditos de contribuidor.
- `v1.17.0`: avisador de propuestas pendientes junto al botón de exportación administrativa.
- `v1.17.1`: corrección de la extracción de propuestas con protección de borrado seguro activa.

## Datos históricos verificados

El 24 de mayo de 2026 se verificaron estos valores en producción:

- Total de prompts: `5548`
- Premium: `1395`
- No Premium: `4153`

Durante la preparación de la PR #9 se observaron `49` altas en los 14 días anteriores, de las cuales `43` eran Premium. Son cifras históricas y no deben tratarse como valores actuales.

Los scripts de `supabase/manual/` documentan la sincronización puntual de Premium realizada desde el Excel maestro. No deben ejecutarse otra vez sin revisar primero su impacto y los datos actuales.

## Seguridad y acceso

- Las lecturas se hacen por REST con el token del usuario autenticado.
- Las políticas RLS exigen que el usuario esté aprobado.
- Las escrituras se realizan mediante `prompts-proxy`.
- Un usuario no autenticado debe recibir `401` del proxy.
- Un usuario aprobado puede enviar propuestas; sin permisos de administración debe recibir `403` en el resto de escrituras.
- La clave publicable de Supabase puede estar en el frontend.
- Nunca deben añadirse al frontend ni al repositorio claves `service_role`, `sb_secret_...`, contraseñas, claves de base de datos o secretos de Edge Functions.

Las migraciones de aprobación de usuarios, RLS y permisos se encuentran en `supabase/migrations/`.

## Despliegue

### Frontend

GitHub Actions publica el sitio estático en GitHub Pages mediante `.github/workflows/deploy.yml`. El workflow no debe inyectar secretos ni escribir commits en `main`.

Si la web no refleja una versión nueva:

1. Confirmar que el cambio está fusionado en `main`.
2. Revisar que el workflow de Pages haya terminado correctamente.
3. Confirmar que GitHub Pages usa `GitHub Actions` como fuente.
4. Forzar una recarga sin caché.

### Edge Function

Los cambios en `supabase/functions/prompts-proxy/index.ts` no se despliegan con GitHub Pages. Hay que desplegar `prompts-proxy` por separado desde Supabase Dashboard o con Supabase CLI y verificar:

- llamadas no autenticadas: `401`;
- usuario autenticado no administrador: `403`;
- escrituras administrativas autenticadas: correctas;
- escrituras REST directas con clave publicable: rechazadas.

No es necesario desplegar la Edge Function cuando el cambio afecta únicamente a `index.html` o a scripts estáticos.

## Reglas de desarrollo

- Usar `document.querySelector` para acceso al DOM.
- Usar `const` y `let`; evitar `var`.
- Usar camelCase para variables y funciones.
- Documentar funciones complejas con JSDoc.
- Mantener scripts en `/scripts` y el punto de entrada en `index.html`.
- Mantener compatibilidad con navegadores modernos ES6+.
- Actualizar la versión visible conforme a versionado semántico en cada cambio de aplicación.

## Flujo recomendado en Windows

1. Trabajar desde `C:\Users\anita\Proyectos\Promptylandia`.
2. Ejecutar `git pull --ff-only` antes de comenzar.
3. Crear una rama por cambio.
4. Mantener el alcance pequeño.
5. Actualizar la versión semántica visible y las notas de versión.
6. Ejecutar las pruebas JavaScript existentes.
7. Revisar `git status` y el diff antes de confirmar cambios.
8. Abrir una PR y fusionarla tras validar.
9. Comprobar GitHub Pages.
10. Desplegar `prompts-proxy` solo cuando haya cambiado.

## Controles pendientes recomendados

Antes de uso comercial o de mayor exposición:

- activar protección de la rama `main`;
- exigir PR antes de fusionar;
- exigir revisiones y checks cuando estén disponibles;
- impedir force push y eliminación de `main`;
- mantener 2FA en la cuenta de GitHub;
- verificar periódicamente que no haya secretos en frontend o historial Git.

Consulta también `AGENTS.md` para las reglas de desarrollo y `DEPLOYMENT.md` para las instrucciones operativas y de seguridad.
