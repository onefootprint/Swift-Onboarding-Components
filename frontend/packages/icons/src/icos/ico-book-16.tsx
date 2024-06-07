import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoBook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.88 3.112c0-.642.52-1.162 1.162-1.162h1.162v11.168H4.042c-.642 0-1.162-.52-1.162-1.162V3.112Zm2.324 11.406v.231a.7.7 0 1 0 1.4 0v-.23h5.351a2.562 2.562 0 0 0 2.562-2.563V3.112A2.562 2.562 0 0 0 11.955.55H4.042A2.562 2.562 0 0 0 1.48 3.112v8.844a2.562 2.562 0 0 0 2.562 2.562h1.162Zm1.4-12.568h5.351c.642 0 1.162.52 1.162 1.162v8.844c0 .642-.52 1.162-1.162 1.162H6.604V1.95Zm3.024 2.274a.75.75 0 1 0 0 1.5h.465a.75.75 0 0 0 0-1.5h-.465Zm-.75 3.543a.75.75 0 0 1 .75-.75h.465a.75.75 0 0 1 0 1.5h-.465a.75.75 0 0 1-.75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBook16;
