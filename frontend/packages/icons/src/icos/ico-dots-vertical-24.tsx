import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsVertical24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 5.958a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666ZM12 12.833a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666ZM12 19.708a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666Z"
        fill={theme.color[color]}
      />
      <path
        d="M12 5.958a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666ZM12 12.833a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666ZM12 19.708a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDotsVertical24;
