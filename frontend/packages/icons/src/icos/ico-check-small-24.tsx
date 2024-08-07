import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M15.04 8.645a.774.774 0 0 0-.195.127 222.54 222.54 0 0 0-2.155 2.441l-2.061 2.353-.784-.778c-.593-.588-.823-.79-.94-.828-.62-.199-1.182.432-.909 1.02.049.104.464.547 1.189 1.267.966.958 1.135 1.11 1.267 1.134.207.039.485.003.608-.077.143-.094 4.864-5.494 4.949-5.662.122-.239.068-.607-.121-.815-.179-.198-.588-.286-.848-.182"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckSmall24;
