import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPin24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m5.333 18.667 3.334-3.334m-3.174-4.007 7.18 7.181a.833.833 0 0 0 1.39-.354l1.595-5.424a.833.833 0 0 1 .37-.48l2.973-1.783a.833.833 0 0 0 .16-1.304l-4.323-4.324a.833.833 0 0 0-1.304.16l-1.783 2.973a.833.833 0 0 1-.48.37L5.847 9.938a.833.833 0 0 0-.354 1.389Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoPin24;
