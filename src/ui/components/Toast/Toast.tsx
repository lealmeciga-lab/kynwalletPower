import styles from './Toast.module.css';

type ToastProps = {
  message: string | null;
};

/**
 * Mensaje flotante informativo (FR-017). La región de anuncios está siempre en el DOM y solo
 * cambia su texto, para que los lectores de pantalla lo anuncien (FR-016). No toma el foco.
 */
export function Toast({ message }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className={styles.region}>
      {message && <p className={styles.toast}>{message}</p>}
    </div>
  );
}
