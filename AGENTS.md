# Agent Context: Proyecto Web (HTML/JS)

## Stack Tecnológico
- **Frontend:** HTML5, CSS3 y JavaScript vanilla.
- **Estructura:** Single-page

## Reglas de Estilo y Código
- **DOM:** Preferir `document.querySelector` sobre métodos antiguos como `getElementById`.
- **Variables:** Usar siempre `const` y `let`. Evitar `var`.
- **Funciones:** Usar Arrow Functions para callbacks y funciones anónimas.
- **Nombres:** Usar camelCase para variables y funciones (ej. `miFuncionPrincipal`).
- **Comentarios:** Documentar funciones complejas con JSDoc (/** ... */).

## Estructura de Archivos
- Mantener los estilos en la carpeta `/css` o `/styles`.
- Mantener los scripts en la carpeta `/js` o `/scripts`.
- El punto de entrada principal es `index.html`.

## Guía de Desarrollo
- **Modo Servidor:** Se recomienda usar la extensión "Live Server" de VS Code para previsualizar.
- **Navegadores:** El código debe ser compatible con navegadores modernos (ES6+).
- **Versionado:** En cada actualización de la aplicación, modificar la versión de la página usando versionado semántico (`MAJOR.MINOR.PATCH`): `PATCH` para correcciones pequeñas, `MINOR` para mejoras compatibles y `MAJOR` para cambios incompatibles o grandes rediseños. Si hay service worker, actualizar también la versión de caché correspondiente.
