(function exposeReleaseNotes(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PromptylandiaReleaseNotes = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const CURRENT_VERSION = '1.12.1';
  const RELEASE_NOTES = Object.freeze([
    {version:'1.12.1', date:'2026-08-03', changes:['Corregido el botón «Importar Excel» para abrir el selector de archivos de forma compatible entre navegadores.']},
    {version:'1.12.0', date:'2026-08-03', changes:['Nuevo historial de versiones con fecha de implantación y las mejoras más recientes en primer lugar.']},
    {version:'1.11.0', date:'2026-08-03', changes:['Añadidos los distintivos y el filtro para prompts actualizados recientemente.']},
    {version:'1.10.1', date:'2026-07-29', changes:['Corregida la búsqueda por nombre cuando el texto contiene caracteres especiales de PostgREST.']},
    {version:'1.10.0', date:'2026-06-12', changes:['Añadidos el filtro, el contador y los distintivos para prompts incorporados durante los últimos 14 días.']},
    {version:'1.9.1', date:'2026-05-24', changes:['Añadido el filtro para mostrar únicamente prompts Premium.']},
    {version:'1.9.0', date:'2026-05-24', changes:['Incorporado el atributo Premium en la búsqueda, edición e importación de prompts.']},
    {version:'1.8.5', date:'2026-05-11', changes:['Corregida la visualización de los controles de paginación en los resultados.']},
    {version:'1.8.4', date:'2026-05-11', changes:['Corregida la paginación de búsquedas procesadas por el servidor.']},
    {version:'1.8.3', date:'2026-05-11', changes:['Renombrada la opción de IA «TODAS IA» a «Multiples».']},
    {version:'1.8.2', date:'2026-05-10', changes:['Reforzadas las redirecciones de confirmación y recuperación de acceso.']},
    {version:'1.8.1', date:'2026-05-10', changes:['Mejorado el flujo de confirmación de email y el reenvío del correo de activación.']},
    {version:'1.8.0', date:'2026-05-09', changes:['Añadido el acceso privado mediante usuarios aprobados y la gestión administrativa de altas.']},
    {version:'1.7.2', date:'2026-05-09', changes:['Protegido el despliegue en GitHub Pages mediante configuración segura de credenciales.']},
    {version:'1.7.1', date:'2026-05-09', changes:['Restringidos los permisos de acceso a la tabla de prompts mediante RLS.']},
    {version:'1.7.0', date:'2026-05-09', changes:['Reforzada la validación de operaciones de escritura en el proxy de prompts.']},
    {version:'1.6.0', date:'2026-05-08', changes:['Limitada la edición de la base de prompts a usuarios administradores autenticados.']},
    {version:'1.5.2', date:'2026-04-21', changes:['Corregido el restablecimiento completo de filtros y resultados de búsqueda.']},
    {version:'1.5.1', date:'2026-04-21', changes:['Añadido el botón para copiar un prompt completo al portapapeles.']},
    {version:'1.5.0', date:'2026-04-20', changes:['Incorporado un sistema de relevancia que prioriza coincidencias por frase, palabras y nombre.']},
    {version:'1.4.6', date:'2026-04-18', changes:['Actualizados el nombre de la aplicación, el título de página y el icono de Promptylandia.']},
    {version:'1.4.5', date:'2026-04-11', changes:['Mejorado el recuento total de prompts para mantenerlo actualizado tras cada cambio.']},
    {version:'1.4.4', date:'2026-04-11', changes:['Mejorado el tratamiento de respuestas vacías del servicio de datos.']},
    {version:'1.4.3', date:'2026-04-11', changes:['Añadida la carga paginada de categorías, subcategorías e IAs.']},
    {version:'1.4.2', date:'2026-04-11', changes:['Normalizados los textos Unicode para evitar fallos al seleccionar categorías con acentos.']},
    {version:'1.4.1', date:'2026-04-11', changes:['Mejorada la creación segura de las opciones de categoría, subcategoría e IA.']},
    {version:'1.4.0', date:'2026-04-11', changes:['Corregida la selección de valores al abrir el modal de edición.']}
  ]);

  const compareVersions = (left, right) => {
    const leftParts = left.version.split('.').map(Number);
    const rightParts = right.version.split('.').map(Number);

    for (let index = 0; index < 3; index += 1) {
      if (leftParts[index] !== rightParts[index]) return rightParts[index] - leftParts[index];
    }
    return 0;
  };

  const getReleaseNotes = () => [...RELEASE_NOTES].sort(compareVersions);

  return Object.freeze({CURRENT_VERSION, RELEASE_NOTES, getReleaseNotes});
});
