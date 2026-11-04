# COMODÍN — Póker de casino retro

Juego web de póker roguelike inspirado en la vibra de los casinos retro, con identidad y assets originales. Una run dura entre **5 y 8 minutos**: tres mesas, comodines y un ranking local para jugar por turnos en la misma computadora.

> **Estado:** V1 funcional y lista para presentar. Incluye la guía de mesa imprimible de M6 (2 hojas A4 o PDF).

---

## Arrancar el juego

Requisitos: **Node.js 22.12+ o 24+** y npm.

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

### Build de producción

```bash
npm run build
npm run preview
```

También hay un comando pensado para la demo local:

```bash
npm run serve
```

Abre `http://127.0.0.1:4173`. El build es estático y funciona sin conexión: fuentes, sonidos e imágenes van incluidos en `dist/`.

### Tests

```bash
npm test          # 23 tests del motor, puntuación, manos y balance
npm run balance   # solo la simulación de balance (200 runs)
```

---

## Cómo se juega (versión corta)

1. **Objetivo:** llegar a los puntos de cada mesa antes de quedarte sin manos. Hay **3 mesas** y si pierdes una, termina la run.
2. **Mano:** tienes **8 cartas** y puedes jugar entre **1 y 5**. La vista previa muestra qué mano de póker formas y cuánto puntuaría.
3. **Puntuación:** `Chips × Mult = puntos`. Las cartas jugadas suman sus chips (2–10 su número, J/Q/K 10, As 11). Los comodines suman chips, mult o multiplicadores.
4. **Manos y descartes:** mesa 1 y 2 dan **3 manos**; mesa 3 da **4 manos**. Todas dan **2 descartes**.
5. **Comodines:** se compran entre mesas en **La Trastienda**. Cuestan $4–$6, puedes llevar hasta **5** y se aplican de izquierda a derecha.
6. **Dinero:** empiezas con **$6**. Al superar una mesa ganas **$4** + **$2 por cada mano sin usar**.

### Mesas y objetivos

| Mesa | Nombre | Objetivo | Manos | Descartes |
| --- | --- | ---: | ---: | ---: |
| 1 | La Cantina | 200 | 3 | 2 |
| 2 | El Club | 700 | 3 | 2 |
| 3 | La Bóveda | 1.800 | 4 | 2 |

### Manos de póker

| Mano | Chips base | Mult base |
| --- | ---: | ---: |
| Escalera de color | 100 | ×8 |
| Póker | 60 | ×7 |
| Full | 40 | ×4 |
| Color | 35 | ×4 |
| Escalera | 30 | ×4 |
| Trío | 30 | ×3 |
| Doble pareja | 20 | ×2 |
| Pareja | 10 | ×2 |
| Carta alta | 5 | ×1 |

Solo las manos de **5 cartas** pueden ser color o escalera. La escalera A-2-3-4-5 también cuenta.

### Comodines

| Comodín | Efecto | Coste |
| --- | --- | ---: |
| Cuatrero | +4 Mult siempre | $5 |
| Gafas Rotas | +12 Chips por cada carta jugada | $6 |
| Dado de la Suerte | ×1.5 Mult si juegas exactamente 5 cartas | $5 |
| El Farolero | +10 Mult si juegas una sola carta | $4 |
| Bailarín | ×2 Mult si la mano es escalera | $6 |
| Pareja Feliz | +8 Mult si es pareja o doble pareja | $4 |
| Coleccionista | +30 Chips por cada As jugado | $5 |
| Reliquia | +2 Mult por cada comodín equipado | $5 |

---

## Presentación con varias personas

El juego está pensado para **pasar el dispositivo**:

1. Abre el juego y pulsa **JUGAR**. La primera vez aparece el tutorial de 4 pasos (se puede saltar).
2. Cada persona escribe su nombre y hace **su propia run**.
3. Al terminar, el puntaje se guarda automáticamente en el ranking local. Pulsa **SIGUIENTE JUGADOR →** para pasar el turno.
4. Desde el menú, **RANKING** muestra la tabla completa. Gana quien tenga más puntos; en empate, quien haya jugado en menos tiempo de mesa.
5. El botón **?** abre la ayuda completa en cualquier pantalla. Desde ahí también se puede abrir la **GUÍA IMPRIMIBLE**. El botón **♪** silencia o activa el sonido.

### Guía de mesa imprimible

En el menú principal, pulsa **GUÍA IMPRIMIBLE** (o ábrela desde el botón **?**). La guía está pensada para imprimirse en **2 hojas A4**:

- **Hoja 1:** objetivo, turno, puntuación, las 3 mesas y la tabla de manos.
- **Hoja 2:** los 8 comodines, orden de puntuación, consejos y glosario.

El botón **IMPRIMIR / PDF** abre el diálogo del navegador. Para guardarla como PDF, elige “Guardar como PDF” en el destino de impresión. La guía se adapta al ancho de la pantalla para revisarla antes de imprimir.

Consejos para la demo:

- Usa pantalla completa (F11) y una resolución de **1280×720** o **1920×1080**.
- El cronómetro se ve durante la mesa, se **pausa en la tienda y en los menús**, y cambia a ámbar a los 6:00 y a rojo a los 8:00. No es un límite duro.
- El progreso y el ranking quedan en `localStorage`, así que puedes recargar sin perder los puntajes.
- Para empezar de cero, usa **BORRAR RANKING** en la pantalla de ranking o borra las claves `comodin.*` desde las herramientas del navegador.

### Guion sugerido (5 minutos)

1. **30 s — Contexto:** “Tres mesas, cinco minutos, una sola oportunidad. Hay que llegar al objetivo de cada mesa.”
2. **60 s — Una mano de ejemplo:** selecciona cartas, señala la vista previa, explica Chips × Mult y pulsa **JUGAR MANO**.
3. **60 s — Decisión:** muestra un descarte y explica cuándo conviene guardar cartas.
4. **60 s — Tienda:** al superar la mesa, entra a **La Trastienda** y compra un comodín. Explica que el orden importa.
5. **90 s — Cierre:** termina la run, muestra el ranking y pasa el dispositivo.

---

## Estructura del proyecto

```text
src/
  game/                 Motor puro, sin React
    engine.ts           Reducer: fases, manos, tienda, dinero, cronómetro
    poker.ts            Evaluación de manos y descripciones en español
    scoring.ts          Pipeline Chips × Mult y comodines
    jokers.ts           Definición de los 8 comodines
    rounds.ts           Objetivos, manos, recompensas y claves de storage
    deck.ts             Baraja, RNG con semilla y reparto inicial
    ranking.ts          Orden, formato de tiempo y fechas
    types.ts            Tipos compartidos y tabla de manos
    __tests__/          Tests de motor, puntuación, manos y balance
  screens/              Pantallas: inicio, tutorial, nombre, mesa, tienda, fin, ranking y guía imprimible
  components/           Cartas, comodines, medidor de objetivo, modales, ayuda
  hooks/                Sonido Web Audio y persistencia en localStorage
  styles/               Tokens, pantallas, mesa, responsive e impresión A4
```

### Ajustar el balance

Casi todo el tuning está en `src/game/rounds.ts`:

- `ROUNDS`: objetivos, manos, descartes y recompensa base por mesa.
- `START_MONEY`, `MAX_JOKERS`, `REWARD_PER_HAND`, `HAND_SIZE_LIMIT`.

Los efectos de los comodines están en `src/game/jokers.ts` y la tabla de manos en `src/game/types.ts`. Después de cambiar algo, ejecuta `npm test`: el test de balance simula 200 runs con una política codiciosa y exige una tasa de victoria entre 25% y 95%. Como referencia, la versión actual ronda el **65%** de victorias con ese bot.

### Persistencia

| Clave | Contenido |
| --- | --- |
| `comodin.ranking.v1` | Runs terminadas y puntajes |
| `comodin.seenTutorial.v1` | Si ya se mostró el tutorial |
| `comodin.muted.v1` | Preferencia de sonido |

No se envía nada a ningún servidor.

### Publicar

`npm run build` genera `dist/`. El proyecto ya usa `base: './'`, así que puede subirse a cualquier hosting estático (Netlify, Vercel, GitHub Pages, un servidor local) sin configuración extra.

---

## Alcance y pendientes

Incluido en V1:

- Run completa de 3 mesas con tienda entre mesas.
- 8 comodines originales, 5 ranuras y venta con reembolso.
- Tutorial inicial, ayuda contextual y glosario.
- Sonido generado con Web Audio y opción de silencio.
- Ranking local con desempate por tiempo y borrado manual.
- Guía de mesa imprimible de 2 hojas A4, también exportable a PDF.
- Diseño responsive y assets/fuentes 100% locales.

Sin pendientes funcionales para V1/M6. Las mejoras futuras posibles son publicación online, más comodines o modos de dificultad.

---

## Créditos

- Código, textos, nombres y arte vectorial de comodines: originales de este proyecto.
- Tipografías: **Silkscreen** y **Space Grotesk**, incluidas localmente vía Fontsource (SIL Open Font License).
- Sin assets, nombres ni textos de Balatro.
