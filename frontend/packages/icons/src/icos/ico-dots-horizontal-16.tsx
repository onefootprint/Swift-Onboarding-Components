import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDotsHorizontal16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.6 8A1.38 1.38 0 1 1 .84 8 1.38 1.38 0 0 1 3.6 8Zm5.775 0a1.38 1.38 0 1 1-2.76 0 1.38 1.38 0 0 1 2.76 0Zm4.395 1.38a1.38 1.38 0 1 0 0-2.76 1.38 1.38 0 0 0 0 2.76Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDotsHorizontal16;
