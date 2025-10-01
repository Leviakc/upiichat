import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { storageService } from "@/services/store";

export function startTour(
  modelSelectElement: HTMLElement,
  searchButtonElement: HTMLElement,
  newChatElement: HTMLElement,
  toggleMenuElement: HTMLElement,
  moreToolsElement: HTMLElement,
  settingsButtonElement: HTMLElement,
) {
  const driverObj = driver({
    showProgress: true,
    nextBtnText: "Siguiente",
    prevBtnText: "Regresar",
    doneBtnText: "Finalizar",
    steps: [
      {
        popover: {
          title: "¡Bienvenido a UPIIChat! 🎉",
          description: "Hagamos un recorrido rápido por las funciones principales de tu asistente IA para UPIICSA.",
          side: "left",
          align: "start",
        },
      },
      {
        element: modelSelectElement,
        popover: {
          title: "🤖 Selección de Modelo",
          description: "Elige el modelo de IA que quieres usar. Cada uno tiene diferentes características y velocidades.",
        },
      },
      {
        element: searchButtonElement,
        popover: {
          title: "🔍 Búsqueda en Base de Conocimientos",
          description: "Haz clic aquí para buscar en nuestra base de datos de preguntas frecuentes sobre UPIICSA.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: newChatElement,
        popover: {
          title: "✨ Nueva Conversación",
          description: "Inicia una nueva conversación con un contexto fresco cuando quieras cambiar de tema.",
          side: "right",
          align: "start",
        },
      },
      {
        element: toggleMenuElement,
        popover: {
          title: "🎛️ Alternar Panel Lateral",
          description: "Muestra u oculta el panel lateral para gestionar tus conversaciones y configuraciones.",
          side: "right",
          align: "start",
        },
      },
      {
        element: moreToolsElement,
        popover: {
          title: "🛠️ Más Herramientas",
          description: "Accede a herramientas adicionales creadas por y para estudiantes del IPN.",
          side: "right",
          align: "start",
        },
      },
      {
        element: settingsButtonElement,
        popover: {
          title: "⚙️ Configuraciones",
          description: "Personaliza tu experiencia y ajusta las configuraciones del asistente según tus preferencias.",
          side: "left",
          align: "start",
        },
      },
    ],
    onDestroyed: () => {
      console.log("Tutorial completado");
      // storageService.updateAppState({ tutorialCompleted: true });
    }
  });

  driverObj.drive();
}
