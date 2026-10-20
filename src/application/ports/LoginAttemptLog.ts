import type { LoginAttemptLogEntry } from '@/domain/auth';

/** Puerto del registro de intentos de inicio de sesión (FR-021, contracts/auth.md). */
export interface LoginAttemptLog {
  record(entry: LoginAttemptLogEntry): void;
}
