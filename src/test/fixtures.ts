import type { DemoAccount } from '@/domain/auth';

/** Cuenta ficticia exclusiva de pruebas; no corresponde a ningún sistema real (specs/002-login-billetera-virtual/research.md R3). */
export const TEST_ACCOUNT: DemoAccount = {
  email: 'steven.luna@example.test',
  password: 'fixture-pass-01',
  displayName: 'Steven Luna',
};
