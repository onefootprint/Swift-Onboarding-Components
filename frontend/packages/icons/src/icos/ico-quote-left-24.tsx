import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoQuoteLeft24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.647 6.71a.575.575 0 0 0-.115.01c-.063.013-2.387.414-3.991 2.342-1.36 1.63-1.461 3.243-1.54 4.406-.002.032 0 .064.003.096l-.002.04c0 1.676 1.096 3.688 3.77 3.688 2.046 0 3.62-1.52 3.62-3.688 0-1.43-.642-3.689-3.534-3.689-.568 0-1.086.1-1.547.279.073-.105.149-.21.23-.317.81-1.044 2.082-1.762 3.234-2.037a.573.573 0 0 0-.128-1.13Zm8.607 0a.574.574 0 0 0-.115.01c-.063.013-2.386.414-3.991 2.342-1.359 1.63-1.461 3.243-1.54 4.406-.002.032 0 .064.003.096l-.002.04c0 1.676 1.097 3.688 3.771 3.688 2.045 0 3.62-1.52 3.62-3.688 0-1.43-.643-3.689-3.535-3.689-.568 0-1.085.1-1.546.279.072-.105.148-.21.23-.317.809-1.044 2.082-1.762 3.234-2.037a.573.573 0 0 0-.129-1.13Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoQuoteLeft24;
