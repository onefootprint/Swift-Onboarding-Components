import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoRefresh24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M14.5 5.818a6.667 6.667 0 0 0-5.417 12.179M9.5 14.5v4.167H5.333"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.833 19.5a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667ZM19.5 11.167a.833.833 0 1 0-1.667 0 .833.833 0 0 0 1.667 0ZM18.608 13.89a.833.833 0 1 1-.833 1.443.833.833 0 0 1 .833-1.443ZM16.473 18.078a.833.833 0 1 0-.833-1.443.833.833 0 0 0 .833 1.443ZM17.773 8.667a.833.833 0 1 1-.834-1.444.833.833 0 0 1 .834 1.444Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoRefresh24;
