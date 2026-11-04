import { JOKERS } from '../game/jokers';
import { MAX_JOKERS, REWARD_PER_HAND, ROUNDS, START_MONEY } from '../game/rounds';
import { HAND_TABLE } from '../game/types';
import { JokerIcon } from '../components/ui/JokerIcon';

interface PrintGuideScreenProps {
  onBack: () => void;
}

function SheetFooter({ page }: { page: number }) {
  return (
    <footer className="sheet-foot">
      <span>COMODÍN · Póker de casino retro · Guía de mesa</span>
      <span>Hoja {page}/2</span>
    </footer>
  );
}

export function PrintGuideScreen({ onBack }: PrintGuideScreenProps) {
  return (
    <div className="screen print-screen">
      <header className="print-toolbar no-print">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← VOLVER
        </button>
        <div className="print-toolbar-title">
          <span className="top-badge">M6 · GUÍA IMPRIMIBLE</span>
          <span className="print-toolbar-note">2 hojas A4 · también se puede guardar como PDF</span>
        </div>
        <button type="button" className="button button--primary" onClick={() => window.print()}>
          IMPRIMIR / PDF
        </button>
      </header>

      <main className="print-sheets">
        <article className="print-sheet">
          <header className="sheet-head">
            <div>
              <span className="sheet-kicker">CASINO RETRO · GUÍA DE MESA</span>
              <h1>COMODÍN</h1>
              <p>Póker de casino retro · 3 mesas · 5–8 minutos · 1 jugador por turno</p>
            </div>
            <div className="sheet-stamp">
              UNA RUN
              <br />
              3 MESAS
            </div>
          </header>

          <section className="sheet-intro">
            <h2>La run en 30 segundos</h2>
            <p>
              Llega al <b>objetivo de puntos</b> de cada mesa antes de quedarte sin manos. Son{' '}
              <b>3 mesas</b> y una sola oportunidad: si pierdes una, termina la run. Gana quien
              consiga más puntos en su run.
            </p>
          </section>

          <section className="sheet-two-col">
            <div>
              <h2>En tu turno</h2>
              <ol className="sheet-steps">
                <li>
                  <b>Mira</b> tus 8 cartas.
                </li>
                <li>
                  <b>Elige de 1 a 5</b> cartas.
                </li>
                <li>
                  <b>Lee la vista previa</b>: mano, Chips × Mult y total.
                </li>
                <li>
                  <b>Juega la mano</b> o <b>descarta</b> (2 por mesa).
                </li>
              </ol>
              <p className="sheet-callout">
                Descarta si no tienes pareja ni proyecto. <b>Descartar no gasta mano.</b>
              </p>
            </div>
            <div>
              <h2>Puntuación</h2>
              <div className="sheet-formula">CHIPS × MULT = PUNTOS</div>
              <p>
                Las cartas jugadas suman chips: 2–10 su número, J/Q/K 10, As 11. Los comodines
                suman chips, mult o multiplicadores.
              </p>
              <p className="sheet-example">
                Pareja de 10: 10 + 20 Chips × 2 Mult = <b>60 puntos</b>
              </p>
            </div>
          </section>

          <section>
            <h2>Las 3 mesas</h2>
            <table className="sheet-table sheet-table--rounds">
              <thead>
                <tr>
                  <th>Mesa</th>
                  <th>Nombre</th>
                  <th>Objetivo</th>
                  <th>Manos</th>
                  <th>Descartes</th>
                </tr>
              </thead>
              <tbody>
                {ROUNDS.map((round) => (
                  <tr key={round.id}>
                    <td>{round.id}</td>
                    <td>{round.name}</td>
                    <td>{round.target.toLocaleString('es')}</td>
                    <td>{round.hands}</td>
                    <td>{round.discards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Manos de póker</h2>
            <table className="sheet-table sheet-table--hands">
              <thead>
                <tr>
                  <th>Mano</th>
                  <th>Ejemplo</th>
                  <th>Chips base</th>
                  <th>Mult base</th>
                </tr>
              </thead>
              <tbody>
                {HAND_TABLE.map((hand) => (
                  <tr key={hand.type}>
                    <td>{hand.name}</td>
                    <td className="sheet-mono">{hand.example}</td>
                    <td>{hand.baseChips}</td>
                    <td>×{hand.baseMult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="sheet-note">
              Color y escalera solo con 5 cartas. La escalera A-2-3-4-5 también cuenta.
            </p>
          </section>

          <section className="sheet-two-col">
            <div>
              <h2>Dinero y tienda</h2>
              <p>
                Empiezas con <b>${START_MONEY}</b>. Al superar las mesas 1 y 2 ganas <b>$4</b> +{' '}
                <b>${REWARD_PER_HAND} por mano sin usar</b>.
              </p>
              <p>
                En <b>La Trastienda</b> compras comodines ($4–$6), hasta <b>{MAX_JOKERS}</b>. Se
                aplican de izquierda a derecha.
              </p>
            </div>
            <div>
              <h2>Pasar el dispositivo</h2>
              <p>
                Al terminar tu run, el puntaje entra al ranking local. Pasa el dispositivo y pulsa{' '}
                <b>SIGUIENTE JUGADOR</b>. En caso de empate gana el menor tiempo de mesa.
              </p>
            </div>
          </section>

          <SheetFooter page={1} />
        </article>

        <article className="print-sheet">
          <header className="sheet-head sheet-head--compact">
            <div>
              <span className="sheet-kicker">REFERENCIA RÁPIDA</span>
              <h1>COMODINES</h1>
              <p>8 comodines · máximo 5 equipados · se aplican de izquierda a derecha</p>
            </div>
            <div className="sheet-stamp">HOJA 2/2</div>
          </header>

          <section>
            <h2>Los 8 comodines</h2>
            <div className="sheet-jokers">
              {JOKERS.map((joker) => (
                <div className="sheet-joker" key={joker.id}>
                  <span className="sheet-joker-icon">
                    <JokerIcon id={joker.id} />
                  </span>
                  <div>
                    <b>
                      {joker.name} <em>${joker.cost}</em>
                    </b>
                    <p>{joker.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="sheet-two-col">
            <div>
              <h2>Orden de puntuación</h2>
              <ol className="sheet-steps">
                <li>Base de la mano.</li>
                <li>+ Chips de las cartas jugadas.</li>
                <li>+ Chips de comodines.</li>
                <li>+ Mult de comodines.</li>
                <li>× Mult de comodines, en orden.</li>
                <li>Redondea el total.</li>
              </ol>
            </div>
            <div>
              <h2>Consejos de mesa</h2>
              <ul className="sheet-list">
                <li>No juegues 5 cartas solo por jugar 5.</li>
                <li>Guarda parejas y figuras altas.</li>
                <li>Descarta manos sin proyecto.</li>
                <li>Compra comodines que combinen entre sí.</li>
                <li>El cronómetro se pausa en la tienda.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Glosario</h2>
            <dl className="sheet-glossary">
              <div>
                <dt>Run</dt>
                <dd>Una partida completa: 3 mesas.</dd>
              </div>
              <div>
                <dt>Mano</dt>
                <dd>Intento de puntuar. Gastas una al jugar.</dd>
              </div>
              <div>
                <dt>Descarte</dt>
                <dd>Cambias cartas sin gastar una mano.</dd>
              </div>
              <div>
                <dt>Comodín</dt>
                <dd>Carta especial que potencia tus manos.</dd>
              </div>
              <div>
                <dt>Trastienda</dt>
                <dd>La tienda entre mesas.</dd>
              </div>
              <div>
                <dt>Objetivo</dt>
                <dd>Puntos que debes alcanzar en la mesa.</dd>
              </div>
            </dl>
          </section>

          <section className="sheet-cheat">
            <h2>Regla de oro</h2>
            <p>
              La vista previa nunca miente: si el total no alcanza, cambia cartas o descarta.{' '}
              <b>Jugar una mano gasta un intento; descartar no.</b>
            </p>
          </section>

          <SheetFooter page={2} />
        </article>
      </main>
    </div>
  );
}
