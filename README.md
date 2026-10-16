# Libreta de Gym

App web para ver el plan del gimnasio por día y anotar los pesos de cada ejercicio, pensada para usar desde el celular (Android).

- **App publicada:** https://claude.ai/artifact/RNdJAvx8JLCU7Qphrqbqh6 (privada, con la cuenta de claude.ai). En Chrome de Android: menú ⋮ → "Agregar a la pantalla principal".
- **Datos:** dentro de claude.ai, el plan y los pesos se guardan en la base de datos del artifact (solo los ve el dueño). Si abrís `index.html` fuera de claude.ai, se guardan en el `localStorage` de ese navegador.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML + CSS + JS, sin build). |
| `plan.json` | Copia del plan actual tal como lo guarda la app. |

## Cargar un plan nuevo

Desde la app: **Cargar un plan nuevo (PDF)**. Lee la planilla del gimnasio con pdf.js (columnas Ejercicio / Video / Series / Reps / Descanso / Observaciones, bloques "Entrenamiento N") y muestra una vista previa antes de guardar. Los pesos anotados se conservan en los ejercicios con el mismo nombre.

## Estructura de datos

- `app/plan`: `{ gym, coach, notes[], days[{ title, exercises[{ id, name, sets, reps, rest, obs, video }] }], loadedAt }`
- `log/<id-del-ejercicio>`: `{ name, entries[{ d: "AAAA-MM-DD", w: kg | null, r, n }] }`
