import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUpdated24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 8.458V12l2.917 2.917"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.292 5.958v3.334h3.333"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.708 14.57a7.722 7.722 0 0 0 7.28 5.138c4.264 0 7.72-3.45 7.72-7.708 0-4.257-3.456-7.708-7.72-7.708a7.722 7.722 0 0 0-7.113 4.71"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUpdated24;
