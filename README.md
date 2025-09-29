# UpiiChat

Este proyecto está inspirado en el proyecto de [CHATBOT-UPIICSA](https://github.com/EduDN/CHATBOT-UPIICSA)
de [Eduardo](https://github.com/EduDN), este proyecto igual busca ayudar a la
comunidad de UPIICSA a resolver sus dudas de una manera rápida y eficiente con
technologías web.

## **🚧 Funcionalidades Pendientes**

### **Funcionalidad Principal y Rendimiento**

- [ ] Usar `IndexedDB` para almacenar los _embeddings_ pre-calculados para cargas instantáneas en visitas recurrentes
- [ ] Resolver bug del service worker

### **Mejoras de UI/UX**

- [x] Implementar menú de tres puntos para editar/eliminar chats (con long-press en móvil)
- [ ] Crear componente toast para notificaciones breves
- [ ] Implementar un buscador de preguntas si el bot puede no saber la respuesta y puede existir
- [ ] Crear componente tooltip para sugerencias de UI
- [ ] Implementar UUID fallback si no está disponible `crypto.randomUUID()`
- [ ] Mejorar accesibilidad de modal:
  - [ ] Gestionar el foco del teclado al abrir/cerrar el modal
  - [ ] Añadir atributos ARIA (`role="dialog"`, `aria-modal="true"`)

### **Arquitectura y Despliegue**

- [ ] Implementar importación dinámica (`import()`) o _code-splitting_ para cargar de forma diferida las librerías de IA

### **Futuras Funcionalidades y Características Avanzadas**

- [x] Agregar opción de "Más herramientas" para mostrar herramientas adicionales que pueden ser útiles para los estudiantes como [saes fill-form](https://chromewbstore.google.com/detail/saes%20fill-form/hlgobbbmkdngojnbhcfhnghjlpnkfelb)
- [ ] Sistema de feedback con Google Sheets como backend
- [ ] Funcionalidad de búsqueda en historial de chats
- [ ] Integrar WebLLM con RAG (_Retrieval-Augmented Generation_) para dispositivos potentes

## **✅ Funcionalidades Completadas**

### **Funcionalidad Principal y Rendimiento**

- [x] Optimizar la carga de estrategias para evitar la reinicialización de una estrategia ya cargada
- [x] Implementar un _Web Worker_ para gestionar la carga en segundo plano de estrategias secundarias (como Pyodide)
- [x] Crear un script de pre-cómputo para generar los _embeddings_ sin conexión
- [x] Configurar un _Service Worker_ para almacenar en caché activos grandes (modelos de IA, Pyodide)

### **Mejoras de UI/UX**

- [x] Implementar un estado de carga global para deshabilitar la entrada de chat mientras se inicializan las estrategias
- [x] Sanitizar las respuestas del asistente para convertir automáticamente las URLs en enlaces clicables
- [x] Añadir un botón "Copiar Mensaje" a las respuestas del asistente
- [x] Arreglar "New chat" error para mobile
- [x] Add vercel json to redirect everything to the SPA
- [x] Implementar un historial de chat persistente usando `localStorage`
- [x] Crear un componente modal para mostrar información adicional o configuraciones

### **Arquitectura y Despliegue**

- [x] Introducir un enrutador (_router_) para manejar múltiples vistas
- [x] Convertir la aplicación en una _Progressive Web App_ (PWA) completa

## Tecnologías utilizadas

- TypeScript
- Web assembly (con python)
- PWA (Progressive Web App)
- Transformers.js
- Web components

## Instalación del proyecto

```bash
$ pnpm install
$ yarn install
$ npm install
$ deno install
$ bun install
```

## Contribuir

Si desea contribuir a este proyecto, no dude en ponerse en contacto.
