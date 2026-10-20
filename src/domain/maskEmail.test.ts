import { maskEmail } from './maskEmail';

describe('maskEmail (FR-021, data-model.md)', () => {
  it.each([
    ['  Steven@Ejemplo.com ', 's***@ejemplo.com'],
    ['a@b.co', 'a***@b.co'],
    ['usuario.com', 'u***'],
  ])('FR-021: "%s" → "%s"', (input, expected) => {
    expect(maskEmail(input)).toBe(expected);
  });

  it('FR-021: un correo vacío (o solo espacios) → null', () => {
    expect(maskEmail('')).toBeNull();
    expect(maskEmail('   ')).toBeNull();
  });

  it('FR-013: nunca devuelve la parte local completa', () => {
    expect(maskEmail('steven.luna@example.test')).not.toContain('steven.luna');
  });
});
