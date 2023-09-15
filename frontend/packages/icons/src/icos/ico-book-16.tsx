import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoBook16 = ({
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
        d="M2.93 3.112C2.93 2.498 3.428 2 4.042 2h1.112v11.068H4.042a1.112 1.112 0 0 1-1.112-1.112V3.112Zm2.224 11.456v.181a.75.75 0 0 0 1.5 0v-.18h5.301a2.612 2.612 0 0 0 2.612-2.613V3.112A2.612 2.612 0 0 0 11.955.5H4.042A2.612 2.612 0 0 0 1.43 3.112v8.844a2.612 2.612 0 0 0 2.612 2.612h1.112ZM6.654 2h5.301c.614 0 1.112.498 1.112 1.112v8.844c0 .614-.497 1.112-1.112 1.112H6.654V2Zm2.974 2.224a.75.75 0 1 0 0 1.5h.465a.75.75 0 0 0 0-1.5h-.465Zm-.75 3.543a.75.75 0 0 1 .75-.75h.465a.75.75 0 0 1 0 1.5h-.465a.75.75 0 0 1-.75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBook16;
