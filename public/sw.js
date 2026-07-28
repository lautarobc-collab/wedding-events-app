// Service worker mínimo: solo existe para que el navegador considere la app
// instalable (PWA). Sin caché ni modo offline — cada petición pasa directo
// a la red, la app depende de datos siempre frescos de Supabase.
self.addEventListener("fetch", () => {});
