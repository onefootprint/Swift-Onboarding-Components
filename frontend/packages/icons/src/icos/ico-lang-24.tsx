import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLang24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m16.56 8.857-4.44 10.929h1.793l.93-2.201h3.435l.93 2.2H21L16.56 8.858Zm-1.012 7.058 1.012-3.117 1.013 3.117h-2.026Zm-2.44-1.594c-.01-.007-.782-.598-1.724-1.619 1.502-2.035 2.352-4.349 2.7-5.439h2.059v-1.67h-5.237V4h-1.67v1.594H4v1.67h8.32c-.361 1.022-1.027 2.637-2.041 4.111-1.24-1.648-1.79-2.88-1.796-2.892l-.271-.537-1.442.835.26.526c.035.06.653 1.438 2.077 3.285l.105.136c-1.886 2.157-3.383 3-3.402 3.015l-.596.4.873 1.366.732-.435c.084-.064 1.569-.911 3.491-3.066.93.998 1.64 1.55 1.681 1.582l.471.325.645-1.594Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLang24;
