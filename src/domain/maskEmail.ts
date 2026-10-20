import { normalizeEmail } from './validation';

const MASK = '***';

/**
 * Enmascara un correo para los registros de diagnóstico (FR-021): conserva el primer carácter
 * de la parte local y el dominio completo. Nunca expone el correo completo (FR-013).
 */
export function maskEmail(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (normalized === '') return null;

  const at = normalized.indexOf('@');
  const domain = at === -1 ? '' : normalized.slice(at);
  return `${normalized[0]}${MASK}${domain}`;
}
