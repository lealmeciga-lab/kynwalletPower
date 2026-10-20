import socialIcon from '@/ui/assets/social-placeholder.svg';
import { Button } from '../Button/Button';

type SocialButtonProps = {
  provider: string;
  onClick: () => void;
};

/** Botón de proveedor externo. El icono es el marcador de posición del diseño (specs/001-login-billetera/research.md R11). */
export function SocialButton({ provider, onClick }: SocialButtonProps) {
  return (
    <Button variant="secondary" onClick={onClick}>
      <img src={socialIcon} alt="" width={20} height={20} />
      {provider}
    </Button>
  );
}
