import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoX24 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
        d="m13.428 10.977 5.585-6.358H17.69l-4.851 5.52-3.872-5.52H4.5l5.857 8.347L4.5 19.632h1.323l5.12-5.83 4.09 5.83H19.5M6.3 5.596h2.033l9.356 13.107h-2.033"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoX24;
