import type { LoginAttemptLog } from '@/application/ports/LoginAttemptLog';
import type { LoginAttemptLogEntry } from '@/domain/auth';

/** Registro de intentos en la consola del navegador (FR-021). Único uso permitido de `console`. */
export class ConsoleLoginAttemptLog implements LoginAttemptLog {
  record(entry: LoginAttemptLogEntry): void {
    console.info(entry.event, entry);
  }
}
