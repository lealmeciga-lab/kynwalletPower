import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { SocialButton } from './SocialButton';

describe('SocialButton', () => {
  it('botón con el nombre del proveedor e icono decorativo; invoca onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(<SocialButton provider="Google" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Google' });
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('FR-016: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<SocialButton provider="Apple" onClick={() => {}} />);
    await expectNoA11yViolations(container);
  });
});
