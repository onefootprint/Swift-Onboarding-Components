import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCloseSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M16.903 8.366a.9.9 0 1 0-1.273-1.272l-3.632 3.631-3.632-3.631a.9.9 0 0 0-1.272 1.272l3.631 3.632-3.631 3.632a.9.9 0 0 0 1.272 1.273l3.632-3.632 3.632 3.632a.9.9 0 1 0 1.273-1.273l-3.632-3.632 3.632-3.632Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCloseSmall24;
