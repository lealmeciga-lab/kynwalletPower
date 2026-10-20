import type { AuthResult } from '@/domain/auth';
import { validateCredentials, type CredentialErrors } from '@/domain/validation';

export type Field = 'email' | 'password';
export type FieldErrors = CredentialErrors;

export type LoginState = {
  status: 'editing' | 'submitting' | 'authError' | 'welcome';
  values: Record<Field, string>;
  touched: Record<Field, boolean>;
  fieldErrors: FieldErrors;
  authError: 'invalid-credentials' | 'unavailable' | null;
  welcomeName: string | null;
  rememberMe: boolean;
  notice: { message: string; id: number } | null;
};

export type LoginAction =
  | { type: 'change'; field: Field; value: string }
  | { type: 'blur'; field: Field }
  | { type: 'toggleRemember'; checked: boolean }
  | { type: 'showNotice'; message: string }
  | { type: 'dismissNotice'; id: number }
  | { type: 'submit' }
  | { type: 'result'; result: AuthResult }
  | { type: 'logout' };

export const initialLoginState: LoginState = {
  status: 'editing',
  values: { email: '', password: '' },
  touched: { email: false, password: false },
  fieldErrors: {},
  authError: null,
  welcomeName: null,
  rememberMe: false,
  notice: null,
};

/** Errores visibles: solo los de campos ya tocados (FR-005). */
function visibleErrors(values: LoginState['values'], touched: LoginState['touched']): FieldErrors {
  const errors = validateCredentials(values);
  const visible: FieldErrors = {};
  if (touched.email && errors.email) visible.email = errors.email;
  if (touched.password && errors.password) visible.password = errors.password;
  return visible;
}

/** Máquina de estados del formulario (data-model.md, LoginFormState). */
export function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values, [action.field]: action.value };
      return {
        ...state,
        status: state.status === 'authError' ? 'editing' : state.status,
        authError: null,
        values,
        fieldErrors: visibleErrors(values, state.touched),
      };
    }

    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return { ...state, touched, fieldErrors: visibleErrors(state.values, touched) };
    }

    case 'toggleRemember':
      // FR-018: solo visual, no se persiste.
      return { ...state, rememberMe: action.checked };

    case 'showNotice':
      // FR-017: un aviso nuevo reemplaza al anterior y reinicia su tiempo (id nuevo).
      return { ...state, notice: { message: action.message, id: (state.notice?.id ?? 0) + 1 } };

    case 'dismissNotice':
      // Un temporizador viejo nunca cierra un aviso más nuevo.
      return state.notice?.id === action.id ? { ...state, notice: null } : state;

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = { email: true, password: true };
      const fieldErrors = visibleErrors(state.values, touched);
      // FR-006: con errores de validación no se compara contra las cuentas ni se pasa a submitting.
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return { ...state, status, touched, fieldErrors, authError: null, notice: null };
    }

    case 'result':
      // FR-006: los errores de validación ya se mostraron en `submit`.
      if (action.result.kind === 'validation-error') return state;
      if (action.result.kind === 'success') {
        return { ...state, status: 'welcome', welcomeName: action.result.displayName };
      }
      return {
        ...state,
        status: 'authError',
        authError: action.result.kind,
        values: { ...state.values, password: '' },
      };

    case 'logout':
      return initialLoginState;
  }
}
