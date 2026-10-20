import type { AuthResult, LoginAttemptLogEntry } from '@/domain/auth';
import type { AuthGateway } from './ports/AuthGateway';
import type { LoginAttemptLog } from './ports/LoginAttemptLog';
import { createAuthenticate } from './authenticate';

const NOW = new Date('2026-10-19T15:30:00.000Z');
const VALID = { email: ' Ana@Example.test ', password: ' con espacios ' };

function setup(gatewayResult: AuthResult | Error = { kind: 'success', displayName: 'Ana' }) {
  const gateway: AuthGateway = {
    authenticate:
      gatewayResult instanceof Error
        ? vi.fn().mockRejectedValue(gatewayResult)
        : vi.fn().mockResolvedValue(gatewayResult),
  };
  const entries: LoginAttemptLogEntry[] = [];
  const log: LoginAttemptLog = { record: vi.fn((entry) => void entries.push(entry)) };
  const authenticate = createAuthenticate({ gateway, log, now: () => NOW });
  return { gateway, log, entries, authenticate };
}

describe('createAuthenticate (contracts/auth.md)', () => {
  it('delega con el correo normalizado y la contraseña sin modificar', async () => {
    const { gateway, authenticate } = setup();
    const result = await authenticate(VALID);
    expect(gateway.authenticate).toHaveBeenCalledWith({
      email: 'ana@example.test',
      password: ' con espacios ',
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Ana' });
  });

  it('U1 / FR-006: credenciales inválidas → validation-error sin llamar al gateway', async () => {
    const { gateway, entries, authenticate } = setup();
    const result = await authenticate({ email: 'usuario.com', password: 'corta' });
    expect(result).toEqual({ kind: 'validation-error' });
    expect(gateway.authenticate).not.toHaveBeenCalled();
    expect(entries).toEqual([
      {
        event: 'login_attempt',
        outcome: 'validation-error',
        email: 'u***',
        timestamp: NOW.toISOString(),
      },
    ]);
  });

  it('U2 / FR-021: éxito → registra success', async () => {
    const { entries, authenticate } = setup();
    await authenticate(VALID);
    expect(entries).toEqual([
      {
        event: 'login_attempt',
        outcome: 'success',
        email: 'a***@example.test',
        timestamp: NOW.toISOString(),
      },
    ]);
  });

  it('U3 / FR-021: credenciales incorrectas → registra invalid-credentials', async () => {
    const { entries, authenticate } = setup({ kind: 'invalid-credentials' });
    const result = await authenticate(VALID);
    expect(result).toEqual({ kind: 'invalid-credentials' });
    expect(entries.map((e) => e.outcome)).toEqual(['invalid-credentials']);
  });

  it.each([
    ['devuelve unavailable', { kind: 'unavailable' } as AuthResult],
    ['lanza una excepción', new Error('fallo interno')],
  ])(
    'U4 / FR-020: si el gateway %s → unavailable y registra unexpected-error',
    async (_label, gatewayResult) => {
      const { entries, authenticate } = setup(gatewayResult);
      await expect(authenticate(VALID)).resolves.toEqual({ kind: 'unavailable' });
      expect(entries.map((e) => e.outcome)).toEqual(['unexpected-error']);
    },
  );

  it('U5 / FR-013: la entrada lleva el correo enmascarado y nunca la contraseña', async () => {
    const { entries, authenticate } = setup({ kind: 'invalid-credentials' });
    await authenticate({ email: 'steven.luna@example.test', password: 'secreto-muy-largo' });
    const serialized = JSON.stringify(entries);
    expect(serialized).not.toContain('secreto-muy-largo');
    expect(serialized).not.toContain('steven.luna@example.test');
    expect(entries[0]?.email).toBe('s***@example.test');
  });

  it('U6: si el registro falla, el resultado no cambia', async () => {
    const { gateway } = setup();
    const log: LoginAttemptLog = {
      record: () => {
        throw new Error('consola no disponible');
      },
    };
    const authenticate = createAuthenticate({ gateway, log, now: () => NOW });
    await expect(authenticate(VALID)).resolves.toEqual({ kind: 'success', displayName: 'Ana' });
  });

  it('FR-021: exactamente una entrada por llamada', async () => {
    const { log, authenticate } = setup();
    await authenticate(VALID);
    await authenticate({ email: '', password: '' });
    expect(log.record).toHaveBeenCalledTimes(2);
  });
});
