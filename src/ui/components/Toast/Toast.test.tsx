import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/a11y';
import { Toast } from './Toast';

describe('Toast (FR-017)', () => {
  it('FR-016: la región status con aria-live existe aunque no haya mensaje', () => {
    render(<Toast message={null} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();
  });

  it('FR-016: al cambiar el mensaje cambia el texto sin volver a crear la región', () => {
    const { rerender } = render(<Toast message={null} />);
    const region = screen.getByRole('status');
    rerender(<Toast message="Función no disponible en esta demostración" />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent('Función no disponible en esta demostración');
    rerender(<Toast message={null} />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toBeEmptyDOMElement();
  });

  it('FR-017: no toma el foco al aparecer', () => {
    const { rerender } = render(<Toast message={null} />);
    rerender(<Toast message="Aviso" />);
    expect(document.body).toHaveFocus();
  });

  it('FR-016: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Toast message="Aviso" />);
    await expectNoA11yViolations(container);
  });
});
