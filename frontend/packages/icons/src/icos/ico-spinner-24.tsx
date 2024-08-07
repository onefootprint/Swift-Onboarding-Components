import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpinner24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.24 4.294v.733l.75.026c.852.028 1.468.121 2.07.31a6.942 6.942 0 0 1 4.637 4.788c.156.552.222 1.044.25 1.86l.026.751.743-.011.744-.011-.009-.7c-.011-.805-.056-1.235-.197-1.874a8.49 8.49 0 0 0-4.516-5.747c-1.198-.591-2.386-.859-3.8-.859h-.698v.734"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSpinner24;
