import type { LoginAttemptLogEntry } from '@/domain/auth';
import { ConsoleLoginAttemptLog } from './ConsoleLoginAttemptLog';

describe('ConsoleLoginAttemptLog (FR-021)', () => {
  it('FR-021: escribe una línea estructurada por intento con console.info', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const entry: LoginAttemptLogEntry = {
      event: 'login_attempt',
      outcome: 'success',
      email: 's***@example.test',
      timestamp: '2026-10-19T15:30:00.000Z',
    };

    new ConsoleLoginAttemptLog().record(entry);

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('login_attempt', entry);
    info.mockRestore();
  });
});
