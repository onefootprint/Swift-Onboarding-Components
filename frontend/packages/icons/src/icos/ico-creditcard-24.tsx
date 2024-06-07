import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCreditcard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.5 7.75c0-.69.56-1.25 1.25-1.25h10.5c.69 0 1.25.56 1.25 1.25V9.5h-13V7.75Zm0 3.25v5.25c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V11h-13Zm1.25-6A2.75 2.75 0 0 0 4 7.75v8.5A2.75 2.75 0 0 0 6.75 19h10.5A2.75 2.75 0 0 0 20 16.25v-8.5A2.75 2.75 0 0 0 17.25 5H6.75ZM7 14.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Zm8.75-.75a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCreditcard24;
