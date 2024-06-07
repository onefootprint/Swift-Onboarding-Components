import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWriting24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.75 5.5A2.25 2.25 0 0 0 5.5 7.75v8.5a2.25 2.25 0 0 0 2.25 2.25h6.5a2.25 2.25 0 0 0 2.25-2.25v-.5a.75.75 0 0 1 1.5 0v.5A3.75 3.75 0 0 1 14.25 20h-6.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4h2.5a.75.75 0 0 1 0 1.5h-2.5Zm7.992-.77a2.494 2.494 0 0 1 3.527 3.528l-3.283 3.283a2.88 2.88 0 0 1-1.337.757l-2.717.68a.75.75 0 0 1-.91-.91l.68-2.717a2.88 2.88 0 0 1 .757-1.337l3.283-3.283Zm2.467 1.061a.994.994 0 0 0-1.406 0L13.52 9.074a1.379 1.379 0 0 0-.363.641l-.376 1.504 1.504-.376c.242-.06.464-.186.64-.363l3.284-3.283a.994.994 0 0 0 0-1.406ZM7.75 14.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM7 12.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75-3.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWriting24;
