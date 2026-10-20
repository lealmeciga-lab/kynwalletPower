import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { AuthResult, DemoAccount, LoginCredentials } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Autenticación simulada en memoria (contracts/auth.md, research.md R5). */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly accounts: readonly DemoAccount[] | null;
  private readonly delayMs: number;

  constructor(accounts: readonly DemoAccount[] | null, options: { delayMs?: number } = {}) {
    this.accounts = accounts;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    await wait(this.delayMs);
    try {
      if (!this.accounts) return { kind: 'unavailable' };
      const email = normalizeEmail(credentials.email);
      const account = this.accounts.find((candidate) => normalizeEmail(candidate.email) === email);
      // Correo inexistente y contraseña incorrecta producen el mismo resultado (FR-011).
      if (!account || account.password !== credentials.password) {
        return { kind: 'invalid-credentials' };
      }
      return { kind: 'success', displayName: account.displayName };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
