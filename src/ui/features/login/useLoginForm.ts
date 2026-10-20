import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Authenticate } from '@/application/authenticate';
import { validateCredentials } from '@/domain/validation';
import { initialLoginState, loginReducer, type Field, type FieldErrors } from './loginReducer';

/** FR-017: duración del aviso flotante. */
export const NOTICE_DURATION_MS = 4000;

export function useLoginForm(authenticate: Authenticate, noticeDurationMs = NOTICE_DURATION_MS) {
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // FR-017: cada aviso nuevo (id nuevo) programa su cierre y cancela el anterior.
  const noticeId = state.notice?.id;
  useEffect(() => {
    if (noticeId === undefined) return;
    const timer = setTimeout(
      () => dispatch({ type: 'dismissNotice', id: noticeId }),
      noticeDurationMs,
    );
    return () => clearTimeout(timer);
  }, [noticeId, noticeDurationMs]);

  const change = useCallback((field: Field, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const blur = useCallback((field: Field) => dispatch({ type: 'blur', field }), []);

  /**
   * Cada envío pasa por el caso de uso, que lo registra (FR-021). Solo un envío válido marca la
   * llamada en curso y pasa por `submitting` (FR-006, FR-008). Devuelve los errores para que la
   * vista gestione el foco.
   */
  const submit = useCallback((): FieldErrors => {
    if (inFlight.current) return {};
    const errors = validateCredentials(state.values);
    const valid = Object.keys(errors).length === 0;
    dispatch({ type: 'submit' });

    if (valid) inFlight.current = true;
    void authenticate(state.values).then((result) => {
      if (valid) inFlight.current = false;
      if (mounted.current) dispatch({ type: 'result', result });
    });
    return errors;
  }, [authenticate, state.values]);

  const logout = useCallback(() => dispatch({ type: 'logout' }), []);

  const toggleRemember = useCallback(
    (checked: boolean) => dispatch({ type: 'toggleRemember', checked }),
    [],
  );

  const showNotice = useCallback(
    (message: string) => dispatch({ type: 'showNotice', message }),
    [],
  );

  return { state, change, blur, submit, logout, toggleRemember, showNotice };
}
