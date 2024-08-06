import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWallet24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.125 7.417v8.958a2.5 2.5 0 0 0 2.5 2.5h10.417c.46 0 .833-.373.833-.833v-7.917a.833.833 0 0 0-.833-.833h-2.5M5.125 7.417c0 1.035.84 1.875 1.875 1.875h8.542M5.125 7.417a2.292 2.292 0 0 1 2.292-2.292h7.474c.36 0 .65.291.65.651v3.516"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M14.916 14.708a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.417}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoWallet24;
