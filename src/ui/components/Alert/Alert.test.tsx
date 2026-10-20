import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/a11y';
import { Alert } from './Alert';

describe('Alert', () => {
  it('FR-016: usa role="alert"', () => {
    render(<Alert>Falló</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
  });

  it('FR-016: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Alert>Falló</Alert>);
    await expectNoA11yViolations(container);
  });
});
