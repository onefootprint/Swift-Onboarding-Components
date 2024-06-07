import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDotSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <circle cx={8} cy={8} r={3} fill={theme.color[color]} />
    </svg>
  );
};
export default IcoDotSmall16;
