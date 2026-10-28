# Libreta de Gym

App web para ver el plan del gimnasio por día y anotar los pesos de cada ejercicio, pensada para usar desde el celular (Android).

**Abrir la app:** https://libreta-gym.firebaseapp.com (Firebase Hosting, el link para compartir). También sigue en https://androettojuan.github.io/libreta-gym/ (GitHub Pages).

`libreta-gym.web.app` lleva sola a `libreta-gym.firebaseapp.com`: ahí el ingreso con Google pasa por otro dominio y algunos navegadores pierden la sesión a la vuelta, sin mostrar error. No redirige si en ese celular ya se usó la app sin cuenta en `web.app`, para no dejar esos datos atrás.

## Publicar

La misma app vive en los dos lugares; el manifest usa rutas relativas para que funcione en los dos.

- **GitHub Pages:** se publica sola al subir a `main`.
- **Firebase Hosting:** a mano, con `firebase deploy --only hosting` (config en `firebase.json`).

En cada cambio subir la versión de `CACHE` en `sw.js` y publicar en los dos.

## Instalar en Android

1. Abrí el link en Chrome.
2. Menú ⋮ → **Instalar app** (o "Agregar a la pantalla principal").

Queda con su ícono, se abre en pantalla completa y funciona sin internet después de la primera vez.

La primera vez que se abre desde el navegador, la app muestra arriba un cartel **Instalá la app**: en Android abre el instalador de Chrome; en iPhone explica cómo agregarla desde **Compartir → Agregar a inicio**. Con «Ahora no» el cartel no vuelve a aparecer, pero en la fila **Compartí la app** (abajo de todo) queda el botón **Instalar**. Una vez instalada no se muestra más.

## Compartir la app

Abajo de cada pantalla, un recuadro junta en una fila cada uno la cuenta (entrar o salir), **Compartí la app** y el cafecito. **Compartir** abre el menú de compartir del celular (WhatsApp, etc.) con el link. Si el navegador no lo tiene, copia el link.

## Dónde se guardan los datos

- **Con cuenta (Entrar con Google):** en Firebase (proyecto `libreta-gym`), en Firestore bajo `users/<uid>/data/plan` y `users/<uid>/logs/<ejercicio>`. Cada persona ve solo lo suyo (ver `firestore.rules`). Funciona sin señal y sincroniza al volver la conexión.
- **Sin cuenta:** en el celular (almacenamiento del navegador), sin sincronizar. Desde **Copia de seguridad → Guardar copia** se descarga un `.json` con el plan y todos los pesos; con **Restaurar copia** se vuelve a cargar.

Al entrar con una cuenta nueva en un celular que ya tenía pesos anotados sin cuenta, la app ofrece subirlos.

### Configuración de Firebase

1. Authentication → Método de acceso → **Google** habilitado.
2. Authentication → Configuración → Dominios autorizados → agregar `androettojuan.github.io`.
3. Firestore Database → crear base de datos → pegar en **Reglas** el contenido de `firestore.rules` y publicar.

## Cargar un plan nuevo

Desde la app: **Cargar un plan nuevo (PDF)**. Lee la planilla del gimnasio con pdf.js y muestra una vista previa antes de guardar. Con **Corregir antes de guardar** se puede arreglar lo que haya leído mal. Los pesos anotados se conservan en los ejercicios con el mismo nombre.

Entiende dos tipos de planilla:

- **En lista**: bloques "Entrenamiento N" con las columnas Ejercicio / Video / Series / Reps / Descanso / Observaciones.
- **En grilla**: una columna por día (*LUNES (tren inferior)*, *MARTES*…) y un ejercicio por celda, como *Press banca plano 3x8-10*. Las celdas **COMBINADOS** arman grupos de ejercicios que se hacen juntos y quedan como *Combinado 1, 2…* en las observaciones. Del encabezado toma el profe, el gimnasio y las observaciones.

## Armar el plan a mano

Sin PDF: **Armar mi plan a mano** (al entrar sin plan) o **Editar mi plan** (abajo de los ejercicios). Se ponen los días y en cada uno los ejercicios con series, repeticiones, descanso, observaciones y link al video; se pueden agregar, quitar y reordenar. Si se cambia el nombre de un ejercicio, su historial de pesos sigue.

Cada persona nueva arranca sin plan y carga el suyo desde el PDF o lo arma a mano.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML + CSS + JS, sin build). |
| `firestore.rules` | Reglas de seguridad de Firestore (cada usuario accede solo a lo suyo). |
| `manifest.webmanifest`, `icon*.png`, `icon.svg` | Datos e íconos para instalarla como app. |
| `sw.js` | Service worker: deja la app disponible sin conexión. |
| `firebase.json`, `.firebaserc` | Publicación en Firebase Hosting. |

## Estructura de datos

- Plan: `{ gym, coach, notes[], days[{ title, exercises[{ id, name, sets, reps, rest, obs, video }] }], loadedAt }`
- Pesos por ejercicio: `{ name, entries[{ d: "AAAA-MM-DD", w: kg | null, r, n }] }`
