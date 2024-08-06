import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLightBulb24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.5 17v-.868c0-.322.188-.61.465-.774l.041-.025a5.833 5.833 0 1 0-5.971.025.912.912 0 0 1 .465.774V17m5 0v.833a2.5 2.5 0 1 1-5 0V17m5 0h-5"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLightBulb24;
