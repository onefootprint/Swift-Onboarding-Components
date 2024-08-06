import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShield24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m9.708 11.583 1.459 1.459 3.125-3.125m4.583 2.01V7.184a.833.833 0 0 0-.57-.79l-6.041-2.015a.833.833 0 0 0-.527 0L5.694 6.393a.833.833 0 0 0-.57.791v4.743c0 4.144 3.542 6.115 6.875 7.913 3.333-1.798 6.875-3.77 6.875-7.913Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShield24;
