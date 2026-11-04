import { JOKERS } from '../../game/jokers';
import { HAND_TABLE } from '../../game/types';
import { JokerIcon } from '../ui/JokerIcon';
import { Modal } from '../ui/Modal';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  onPrint?: () => void;
}

export function HelpModal({ open, onClose, onPrint }: HelpModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="CÓMO SE JUEGA"
      className="help-modal"
      footer={
        <div className="modal-foot-actions">
          {onPrint ? (
            <button type="button" className="button" onClick={onPrint}>
              GUÍA IMPRIMIBLE
            </button>
          ) : null}
          <button type="button" className="button button--primary" onClick={onClose}>
            ENTENDIDO
          </button>
        </div>
      }
    >
      <section className="help-section">
        <h3>El objetivo</h3>
        <p>
          Llega al <b>objetivo de puntos</b> de cada mesa antes de quedarte sin manos. Hay{' '}
          <b>3 mesas</b> y una run dura entre 5 y 8 minutos. Si pierdes una mesa, termina la run.
        </p>
      </section>

      <section className="help-section">
        <h3>Paso a paso</h3>
        <ol className="help-list">
          <li>Tienes <b>8 cartas</b> en la mano y puedes jugar hasta <b>5</b>.</li>
          <li>Selecciona cartas y mira la <b>vista previa</b> antes de jugar.</li>
          <li>Pulsa <b>JUGAR MANO</b>: los puntos se suman al objetivo.</li>
          <li>Si la mano no sirve, usa <b>DESCARTAR</b> (2 por mesa).</li>
          <li>Al superar la mesa, compra <b>comodines</b> en la tienda.</li>
        </ol>
      </section>

      <section className="help-section">
        <h3>Chips × Mult</h3>
        <p>
          Cada mano genera <b className="text-cyan">Chips</b> y <b className="text-gold">Mult</b>.
          Los chips se suman, el mult multiplica. El resultado es{' '}
          <b>
            Chips × Mult = puntos
          </b>
          .
        </p>
        <div className="help-example">
          <span>Pareja de 10</span>
          <b>10 + 20 Chips</b>
          <b>× 2 Mult</b>
          <strong>= 60</strong>
        </div>
        <p className="muted">
          Las cartas jugadas también suman sus chips: 2–10 valen su número, J/Q/K valen 10 y el As
          vale 11.
        </p>
      </section>

      <section className="help-section">
        <h3>Manos de póker</h3>
        <div className="hand-table">
          {HAND_TABLE.map((hand) => (
            <div className="hand-table-row" key={hand.type}>
              <span className="hand-table-name">{hand.name}</span>
              <span className="hand-table-example">{hand.example}</span>
              <span className="hand-table-chips">{hand.baseChips} Chips</span>
              <span className="hand-table-mult">×{hand.baseMult}</span>
            </div>
          ))}
        </div>
        <p className="muted">
          Solo las manos de 5 cartas pueden ser color o escalera. La escalera A-2-3-4-5 también
          cuenta.
        </p>
      </section>

      <section className="help-section">
        <h3>Comodines</h3>
        <p>
          Se compran entre mesas, cuestan $4–$6 y puedes tener hasta <b>5</b>. Se aplican{' '}
          <b>de izquierda a derecha</b> y modifican los chips o el mult de tus manos.
        </p>
        <div className="help-jokers">
          {JOKERS.map((joker) => (
            <div className="help-joker" key={joker.id}>
              <span className="help-joker-icon">
                <JokerIcon id={joker.id} />
              </span>
              <div>
                <b>{joker.name}</b>
                <span>{joker.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="help-section">
        <h3>Glosario</h3>
        <dl className="help-glossary">
          <div>
            <dt>Run</dt>
            <dd>Una partida completa: 3 mesas. Cada jugador hace su propia run.</dd>
          </div>
          <div>
            <dt>Mano</dt>
            <dd>Cada intento de puntuar. Gastas una mano al pulsar JUGAR MANO.</dd>
          </div>
          <div>
            <dt>Descarte</dt>
            <dd>Cambias cartas que no te sirven sin gastar una mano.</dd>
          </div>
          <div>
            <dt>Comodín</dt>
            <dd>Carta especial que potencia tus manos. Máximo 5 por run.</dd>
          </div>
          <div>
            <dt>Trastienda</dt>
            <dd>La tienda entre mesas donde compras y vendes comodines.</dd>
          </div>
        </dl>
      </section>
    </Modal>
  );
}
