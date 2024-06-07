import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFacebook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 4.04a8 8 0 0 0-8 8c0 4.01 2.955 7.323 6.804 7.901v-5.78H8.825v-2.104h1.98v-1.399c0-2.317 1.128-3.334 3.053-3.334.923 0 1.41.069 1.641.1V9.26h-1.313c-.818 0-1.103.774-1.103 1.648v1.15h2.396l-.325 2.102h-2.071v5.798C16.988 19.428 20 16.09 20 12.04a8 8 0 0 0-8-8Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFacebook24;
