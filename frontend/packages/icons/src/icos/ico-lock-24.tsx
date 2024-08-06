import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLock24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15.333 10.333v-2.5a3.333 3.333 0 0 0-6.667 0v2.5M12 13.667v2.5M7 19.5h10c.46 0 .833-.373.833-.833v-7.5a.833.833 0 0 0-.833-.834H7a.833.833 0 0 0-.833.834v7.5c0 .46.373.833.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLock24;
