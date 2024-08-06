import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShare24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.708 5.125h-3.25c-.466 0-.7 0-.878.09a.833.833 0 0 0-.364.365c-.091.178-.091.412-.091.878v11.084c0 .466 0 .7.09.878.08.157.208.284.365.364.178.091.412.091.878.091h11.084c.466 0 .7 0 .878-.09a.833.833 0 0 0 .364-.365c.091-.178.091-.412.091-.878v-3.25m-5.417-9.167h5.417m0 0v5.417m0-5.417-7.708 7.708"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.708 5.125h-3.25c-.466 0-.7 0-.878.09a.833.833 0 0 0-.364.365c-.091.178-.091.412-.091.878v11.084c0 .466 0 .7.09.878.08.157.208.284.365.364.178.091.412.091.878.091h11.084c.466 0 .7 0 .878-.09a.833.833 0 0 0 .364-.365c.091-.178.091-.412.091-.878v-3.25m-5.417-9.167h5.417m0 0v5.417m0-5.417-7.708 7.708"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShare24;
