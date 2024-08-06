import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLogOut24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.375 18.667H6.167a.833.833 0 0 1-.833-.834V6.167c0-.46.373-.834.833-.834h5.208M18.667 12H9.292m9.375 0-3.75 3.75m3.75-3.75-3.75-3.75"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLogOut24;
