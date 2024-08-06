import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSparkles24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M18.041 12.833c-4.212.365-6.51 2.663-6.875 6.875-.38-4.277-2.666-6.398-6.875-6.875 4.276-.493 6.382-2.6 6.875-6.875.477 4.209 2.598 6.495 6.875 6.875Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.492 3.049a.243.243 0 0 0-.483 0c-.092.798-.331 1.359-.716 1.744-.385.385-.946.623-1.744.716a.243.243 0 0 0 0 .482c.785.09 1.358.328 1.752.715.393.385.637.947.707 1.74a.243.243 0 0 0 .484-.001c.068-.78.311-1.353.706-1.747.394-.395.967-.638 1.747-.706a.243.243 0 0 0 0-.484c-.792-.07-1.353-.314-1.739-.707-.387-.394-.625-.967-.714-1.752Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSparkles24;
