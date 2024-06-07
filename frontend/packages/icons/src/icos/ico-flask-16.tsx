import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFlask16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.5 1.5h5m-6.812 8h8.624M6.5 1.5v2.921c0 .378-.107.749-.309 1.068l-3.903 6.183c-.775 1.227.107 2.828 1.558 2.828h8.308c1.451 0 2.334-1.6 1.558-2.828L9.808 5.489A2.003 2.003 0 0 1 9.5 4.421V1.5"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoFlask16;
