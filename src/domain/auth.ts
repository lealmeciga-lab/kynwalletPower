export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult =
  | { kind: 'success'; displayName: string }
  | { kind: 'invalid-credentials' }
  | { kind: 'unavailable' }
  | { kind: 'validation-error' };

/** Resultado de un intento tal como se registra (FR-021). */
export type LoginAttemptOutcome =
  'success' | 'invalid-credentials' | 'validation-error' | 'unexpected-error';

/** Entrada del registro de intentos. No tiene ningún campo de contraseña (FR-013). */
export type LoginAttemptLogEntry = {
  event: 'login_attempt';
  outcome: LoginAttemptOutcome;
  email: string | null;
  timestamp: string;
};

export type DemoAccount = {
  email: string;
  password: string;
  displayName: string;
};
