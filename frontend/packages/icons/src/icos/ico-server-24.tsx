import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoServer24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.708 12V6.792a.833.833 0 0 0-.833-.834H5.125a.833.833 0 0 0-.833.834V12m15.416 0H4.292m15.416 0v5.208c0 .46-.373.834-.833.834H5.125a.833.833 0 0 1-.833-.834V12"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M7.417 9.604a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25Zm0 6.042a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.417}
      />
    </svg>
  );
};
export default IcoServer24;
