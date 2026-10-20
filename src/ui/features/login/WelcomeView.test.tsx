import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { WelcomeView } from './WelcomeView';

describe('WelcomeView', () => {
  it('FR-009: muestra el saludo con el nombre y recibe el foco', () => {
    render(<WelcomeView name="Steven Luna" onLogout={() => {}} />);
    const heading = screen.getByRole('heading', { level: 1, name: '¡Bienvenido, Steven Luna!' });
    expect(heading).toHaveFocus();
  });

  it('FR-010: "Cerrar sesión" invoca onLogout', async () => {
    const onLogout = vi.fn();
    render(<WelcomeView name="Ana" onLogout={onLogout} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('FR-016: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<WelcomeView name="Ana" onLogout={() => {}} />);
    await expectNoA11yViolations(container);
  });
});
