import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAuthenticate } from '@/application/authenticate';
import { ConsoleLoginAttemptLog } from '@/infrastructure/ConsoleLoginAttemptLog';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { App } from './App';

/** Composición real (como en main.tsx), sin espera simulada, con la consola espiada. */
function setupReal() {
  const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  const authenticate = createAuthenticate({
    gateway: new InMemoryAuthGateway([TEST_ACCOUNT], { delayMs: 0 }),
    log: new ConsoleLoginAttemptLog(),
  });
  render(<App authenticate={authenticate} />);
  const user = userEvent.setup();
  const login = async (email: string, password: string) => {
    if (email) await user.type(screen.getByLabelText('Correo electrónico'), email);
    if (password) await user.type(screen.getByLabelText('Contraseña'), password);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  };
  /** Entradas `login_attempt` escritas en la consola. */
  const entries = () =>
    info.mock.calls.filter(([event]) => event === 'login_attempt').map(([, entry]) => entry);
  /** FR-013: todo lo escrito en consola, serializado completo (no con String()). */
  const consoleText = () => info.mock.calls.map((args) => JSON.stringify(args)).join('\n');
  return { login, entries, consoleText, info };
}

afterEach(() => vi.restoreAllMocks());

describe('App · registro de intentos con la composición real (FR-021)', () => {
  it('US1-1 / FR-021: éxito → bienvenida y una entrada success con el correo enmascarado', async () => {
    const { login, entries, consoleText } = setupReal();
    await login(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
    expect(await screen.findByRole('heading', { name: /Bienvenido, Steven Luna/ })).toBeVisible();
    expect(entries()).toEqual([
      expect.objectContaining({
        event: 'login_attempt',
        outcome: 'success',
        email: 's***@example.test',
      }),
    ]);
    expect(consoleText()).not.toContain(TEST_ACCOUNT.password);
    expect(consoleText()).not.toContain(TEST_ACCOUNT.email);
  });

  it.each([
    ['US2-1: contraseña incorrecta', TEST_ACCOUNT.email, 'clave-equivocada-1', 's***@example.test'],
    [
      'US2-2: correo no registrado',
      'nadie@example.test',
      'clave-equivocada-2',
      'n***@example.test',
    ],
  ])(
    '%s → mensaje genérico y una entrada invalid-credentials (FR-021)',
    async (_l, email, pass, masked) => {
      const { login, entries, consoleText } = setupReal();
      await login(email, pass);
      expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
      expect(entries()).toEqual([
        expect.objectContaining({ outcome: 'invalid-credentials', email: masked }),
      ]);
      expect(consoleText()).not.toContain(pass);
      expect(consoleText()).not.toContain(email);
    },
  );

  it('US3-1 / FR-021: envío vacío → una entrada validation-error con email null', async () => {
    const { login, entries } = setupReal();
    await login('', '');
    await vi.waitFor(() =>
      expect(entries()).toEqual([
        expect.objectContaining({ outcome: 'validation-error', email: null }),
      ]),
    );
  });

  it('US3-2 / FR-021: correo "usuario.com" → validation-error con email "u***"', async () => {
    const { login, entries, consoleText } = setupReal();
    await login('usuario.com', 'clave-valida-1');
    await vi.waitFor(() =>
      expect(entries()).toEqual([
        expect.objectContaining({ outcome: 'validation-error', email: 'u***' }),
      ]),
    );
    expect(consoleText()).not.toContain('clave-valida-1');
    expect(consoleText()).not.toContain('usuario.com');
  });
});

describe('App · accesibilidad de la pantalla completa (FR-016, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    // Un envío vacío devuelve validation-error, como el caso de uso real (contracts/auth.md U1).
    const stub = createAuthStub({ kind: 'validation-error' });
    const { container } = render(<App authenticate={stub.authenticate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });
});
