import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { TextField } from './TextField';

describe('TextField', () => {
  it('asocia la etiqueta al input y propaga sus atributos', () => {
    render(
      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="username"
        placeholder="tucorreo@ejemplo.com"
        value=""
        onChange={() => {}}
      />,
    );
    const input = screen.getByLabelText('Correo electrónico');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'username');
    expect(input).toHaveAttribute('placeholder', 'tucorreo@ejemplo.com');
  });

  it('notifica cambios y salida del campo', async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(<TextField label="Nombre" value="" onChange={onChange} onBlur={onBlur} />);
    const input = screen.getByLabelText('Nombre');
    await userEvent.type(input, 'a');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('expone el input mediante ref y muestra endAdornment', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TextField
        label="Contraseña"
        ref={ref}
        value=""
        onChange={() => {}}
        endAdornment={<button type="button">Extra</button>}
      />,
    );
    expect(ref.current).toBe(screen.getByLabelText('Contraseña'));
    expect(screen.getByRole('button', { name: 'Extra' })).toBeInTheDocument();
  });

  it('US3-5: con error marca aria-invalid y lo vincula con aria-describedby', () => {
    render(
      <TextField label="Correo" value="" onChange={() => {}} error="Ingresa un correo válido" />,
    );
    const input = screen.getByLabelText('Correo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Ingresa un correo válido');
    expect(screen.getByText('Ingresa un correo válido')).toBeVisible();
  });

  it('sin error no marca aria-invalid', () => {
    render(<TextField label="Correo" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Correo')).not.toHaveAttribute('aria-invalid');
  });

  it('FR-016: con error no tiene violaciones de accesibilidad', async () => {
    const { container } = render(
      <TextField label="Correo" value="" onChange={() => {}} error="Requerido" />,
    );
    await expectNoA11yViolations(container);
  });

  it('FR-016: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<TextField label="Correo" value="" onChange={() => {}} />);
    await expectNoA11yViolations(container);
  });
});
