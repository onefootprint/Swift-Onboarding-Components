import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoKey16 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.438 2a3.788 3.788 0 0 0-3.759 4.26l-4.353 4.353a.6.6 0 0 0-.176.425v2.437a.6.6 0 0 0 .6.6h2.437a.6.6 0 0 0 .425-.176l.562-.562a.6.6 0 0 0 .176-.425V12.2h.712a.6.6 0 0 0 .425-.176l.937-.937a.6.6 0 0 0 .176-.425V9.95h.712a.6.6 0 0 0 .425-.176l.228-.228A3.787 3.787 0 1 0 10.437 2ZM7.85 5.787a2.588 2.588 0 1 1 2.037 2.53.6.6 0 0 0-.552.162l-.271.271H8a.6.6 0 0 0-.6.6v1.064L6.814 11H5.75a.6.6 0 0 0-.6.6v1.064l-.211.211H3.35v-1.589L7.746 6.89a.6.6 0 0 0 .163-.552 2.599 2.599 0 0 1-.059-.55Zm3.2-.087a.65.65 0 1 0 0-1.3.65.65 0 0 0 0 1.3Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoKey16;
