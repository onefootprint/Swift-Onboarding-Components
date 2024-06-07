import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoUserCircle24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.5a6.5 6.5 0 0 0-5.024 10.625A6.981 6.981 0 0 1 12 14c1.971 0 3.752.815 5.023 2.125A6.5 6.5 0 0 0 12 5.5Zm3.944 11.667A5.482 5.482 0 0 0 12 15.5a5.482 5.482 0 0 0-3.944 1.667A6.472 6.472 0 0 0 12 18.5c1.483 0 2.85-.497 3.944-1.333ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8-3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 10a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUserCircle24;
