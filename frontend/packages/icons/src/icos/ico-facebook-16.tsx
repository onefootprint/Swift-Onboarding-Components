import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFacebook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.006 1A7.036 7.036 0 0 0 .97 8.036c0 3.528 2.599 6.44 5.984 6.949V9.901h-1.74V8.05h1.74v-1.23c0-2.038.993-2.932 2.687-2.932.81 0 1.24.06 1.443.087v1.615H9.928c-.719 0-.97.681-.97 1.45v1.01h2.107l-.286 1.85H8.96V15c3.434-.466 6.083-3.402 6.083-6.964A7.036 7.036 0 0 0 8.006 1Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFacebook16;
