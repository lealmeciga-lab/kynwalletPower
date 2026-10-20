import axe from 'axe-core';

/**
 * Ejecuta axe-core sobre el contenedor y falla con el detalle de las violaciones WCAG 2.1 A/AA.
 * La regla de contraste se omite porque jsdom no calcula estilos; el contraste se verificó
 * sobre los tokens (specs/002-login-billetera-virtual/research.md R7).
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = results.violations.map((v) => `${v.id}: ${v.help}`);
  expect(summary).toEqual([]);
}
