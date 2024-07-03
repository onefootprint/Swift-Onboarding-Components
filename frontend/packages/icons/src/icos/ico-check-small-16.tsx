import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M12.601 4a.615.615 0 0 0-.423.186l-6.329 6.33L3.824 8.49a.615.615 0 1 0-.87.87l2.46 2.459a.615.615 0 0 0 .87 0l6.764-6.764A.616.616 0 0 0 12.601 4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckSmall16;
