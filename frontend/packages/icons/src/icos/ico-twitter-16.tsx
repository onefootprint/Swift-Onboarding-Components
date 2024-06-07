import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoTwitter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M16 3.039a6.552 6.552 0 0 1-1.886.517 3.288 3.288 0 0 0 1.444-1.816 6.582 6.582 0 0 1-2.085.797A3.283 3.283 0 0 0 7.88 5.53 9.319 9.319 0 0 1 1.114 2.1 3.274 3.274 0 0 0 .67 3.751a3.28 3.28 0 0 0 1.46 2.732 3.276 3.276 0 0 1-1.487-.41v.04a3.283 3.283 0 0 0 2.633 3.219 3.284 3.284 0 0 1-1.482.056 3.286 3.286 0 0 0 3.066 2.28A6.584 6.584 0 0 1 0 13.028a9.293 9.293 0 0 0 5.032 1.474c6.038 0 9.338-5.002 9.338-9.34 0-.142-.003-.283-.009-.424A6.68 6.68 0 0 0 16 3.039Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTwitter16;
