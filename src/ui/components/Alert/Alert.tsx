import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertProps = {
  children: ReactNode;
};

/** Mensaje de error global anunciado por tecnologías de asistencia (FR-016). */
export function Alert({ children }: AlertProps) {
  return (
    <div role="alert" className={styles.alert}>
      {children}
    </div>
  );
}
