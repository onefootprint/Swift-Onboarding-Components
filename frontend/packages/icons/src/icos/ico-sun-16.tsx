import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSun16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.001 1.1a.65.65 0 0 1 .65.65v1.014a.65.65 0 1 1-1.3 0V1.75a.65.65 0 0 1 .65-.65Zm0 5.355a1.546 1.546 0 1 0 0 3.093 1.546 1.546 0 0 0 0-3.093ZM5.155 8a2.846 2.846 0 1 1 5.693 0 2.846 2.846 0 0 1-5.693 0Zm6.854-3.088a.65.65 0 0 0-.92-.92l-.8.8a.65.65 0 0 0 .92.92l.8-.8ZM12.589 8a.65.65 0 0 1 .65-.65h1.013a.65.65 0 1 1 0 1.3H13.24a.65.65 0 0 1-.65-.65Zm-1.38 2.288a.65.65 0 1 0-.92.92l.8.8a.65.65 0 1 0 .92-.92l-.8-.8ZM8 12.59a.65.65 0 0 1 .65.65v1.013a.65.65 0 1 1-1.3 0V13.24a.65.65 0 0 1 .65-.65Zm-2.288-1.38a.65.65 0 0 0-.92-.92l-.8.8a.65.65 0 1 0 .92.92l.8-.8ZM1.1 8a.65.65 0 0 1 .65-.65h1.014a.65.65 0 0 1 0 1.3H1.75a.65.65 0 0 1-.65-.65Zm3.813-4.007a.65.65 0 1 0-.92.919l.8.8a.65.65 0 0 0 .92-.92l-.8-.8Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSun16;
