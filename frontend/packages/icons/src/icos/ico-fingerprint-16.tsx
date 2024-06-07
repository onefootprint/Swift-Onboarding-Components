import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFingerprint16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14 14V8c0-2.144-1.164-4.17-2.894-5.172M2.01 10.276V14M2.01 8.207C1.803 4.276 4.808 2 8.005 2M8.005 5.31c1.484 0 2.687 1.035 2.687 2.897M10.692 10.276v1.241M5.318 11.104v1.24C5.318 13.38 4.49 14 4.49 14M7.798 8.62v2.897c0 1.449.662 2.483 2.48 2.483M5.62 6.759A2.68 2.68 0 0 0 5.318 8v1.034"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFingerprint16;
