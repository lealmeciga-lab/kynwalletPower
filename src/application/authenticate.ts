import type { AuthResult, LoginAttemptOutcome, LoginCredentials } from '@/domain/auth';
import { maskEmail } from '@/domain/maskEmail';
import { normalizeEmail, validateCredentials } from '@/domain/validation';
import type { AuthGateway } from './ports/AuthGateway';
import type { LoginAttemptLog } from './ports/LoginAttemptLog';

export type Authenticate = (credentials: LoginCredentials) => Promise<AuthResult>;

type AuthenticateDeps = {
  gateway: AuthGateway;
  log: LoginAttemptLog;
  now?: () => Date;
};

const OUTCOMES: Record<AuthResult['kind'], LoginAttemptOutcome> = {
  success: 'success',
  'invalid-credentials': 'invalid-credentials',
  'validation-error': 'validation-error',
  unavailable: 'unexpected-error',
};

/**
 * Caso de uso: única entrada de cada envío del formulario (contracts/auth.md, U1–U6).
 * Valida, delega en el puerto de autenticación y registra el resultado (FR-021).
 */
export function createAuthenticate({
  gateway,
  log,
  now = () => new Date(),
}: AuthenticateDeps): Authenticate {
  const record = (email: string, result: AuthResult) => {
    try {
      log.record({
        event: 'login_attempt',
        outcome: OUTCOMES[result.kind],
        email: maskEmail(email),
        timestamp: now().toISOString(),
      });
    } catch {
      // U6: un fallo del registro nunca cambia el resultado del inicio de sesión.
    }
  };

  const attempt = async ({ email, password }: LoginCredentials): Promise<AuthResult> => {
    // FR-006: con errores de validación no se compara contra las cuentas.
    if (Object.keys(validateCredentials({ email, password })).length > 0) {
      return { kind: 'validation-error' };
    }
    try {
      return await gateway.authenticate({ email: normalizeEmail(email), password });
    } catch {
      return { kind: 'unavailable' };
    }
  };

  return async (credentials) => {
    const result = await attempt(credentials);
    record(credentials.email, result);
    return result;
  };
}
