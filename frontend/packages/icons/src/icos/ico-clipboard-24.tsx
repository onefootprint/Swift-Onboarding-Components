import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClipboard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15.334 6.167h2.5c.46 0 .833.373.833.833v11.667c0 .46-.373.833-.834.833H6.168a.833.833 0 0 1-.833-.833V7c0-.46.373-.833.833-.833h2.5m6.667 1.666v-2.5A.833.833 0 0 0 14.5 4.5h-5a.833.833 0 0 0-.833.833v2.5h6.667Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoClipboard24;
