# Libreta de Gym

App web para ver el plan del gimnasio por día y anotar los pesos de cada ejercicio, pensada para usar desde el celular (Android).

**Abrir la app:** https://androettojuan.github.io/libreta-gym/

## Instalar en Android

1. Abrí el link en Chrome.
2. Menú ⋮ → **Instalar app** (o "Agregar a la pantalla principal").

Queda con su ícono, se abre en pantalla completa y funciona sin internet después de la primera vez.

## Dónde se guardan los datos

- **Con cuenta (Entrar con Google):** en Firebase (proyecto `libreta-gym`), en Firestore bajo `users/<uid>/data/plan` y `users/<uid>/logs/<ejercicio>`. Cada persona ve solo lo suyo (ver `firestore.rules`). Funciona sin señal y sincroniza al volver la conexión.
- **Sin cuenta:** en el celular (almacenamiento del navegador), sin sincronizar. Desde **Copia de seguridad → Guardar copia** se descarga un `.json` con el plan y todos los pesos; con **Restaurar copia** se vuelve a cargar.

Al entrar con una cuenta nueva en un celular que ya tenía pesos anotados sin cuenta, la app ofrece subirlos.

### Configuración de Firebase

1. Authentication → Método de acceso → **Google** habilitado.
2. Authentication → Configuración → Dominios autorizados → agregar `androettojuan.github.io`.
3. Firestore Database → crear base de datos → pegar en **Reglas** el contenido de `firestore.rules` y publicar.

## Cargar un plan nuevo

Desde la app: **Cargar un plan nuevo (PDF)**. Lee la planilla del gimnasio con pdf.js (columnas Ejercicio / Video / Series / Reps / Descanso / Observaciones, bloques "Entrenamiento N") y muestra una vista previa antes de guardar. Los pesos anotados se conservan en los ejercicios con el mismo nombre.

Para cambiar el plan con el que arranca la app la primera vez, reemplazá `plan.json`.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML + CSS + JS, sin build). |
| `plan.json` | Plan inicial. |
| `manifest.webmanifest`, `icon*.png`, `icon.svg` | Datos e íconos para instalarla como app. |
| `sw.js` | Service worker: deja la app disponible sin conexión. |

## Estructura de datos

- Plan: `{ gym, coach, notes[], days[{ title, exercises[{ id, name, sets, reps, rest, obs, video }] }], loadedAt }`
- Pesos por ejercicio: `{ name, entries[{ d: "AAAA-MM-DD", w: kg | null, r, n }] }`
