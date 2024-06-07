import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLock16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.43 2.747C5.874 2.293 6.637 1.85 8 1.85c1.364 0 2.128.443 2.571.897.373.382.57.895.665 1.542.083.564.08 1.163.078 1.803v.023H4.687v-.023c-.002-.64-.005-1.24.078-1.803.095-.647.292-1.16.665-1.542ZM3.287 6.115c-.003-.635-.006-1.353.093-2.03.118-.806.392-1.643 1.048-2.316C5.158 1.021 6.295.45 8.001.45c1.705 0 2.842.57 3.572 1.32.657.672.93 1.509 1.048 2.316.1.676.096 1.394.093 2.029h.243c.908 0 1.644.736 1.644 1.644v5.192a2.588 2.588 0 0 1-2.588 2.588H3.988A2.588 2.588 0 0 1 1.4 12.951V7.76c0-.908.736-1.644 1.644-1.644h.243ZM2.8 7.759c0-.135.11-.244.244-.244h9.913c.135 0 .244.109.244.244v5.192c0 .656-.532 1.188-1.188 1.188H3.988A1.188 1.188 0 0 1 2.8 12.951V7.76Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLock16;
