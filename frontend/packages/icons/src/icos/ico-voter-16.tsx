import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoVoter16 = ({
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
        d="M1.75 13.25h12.5a1 1 0 0 0 1-1v-8.5a1 1 0 0 0-1-1H1.75a1 1 0 0 0-1 1v8.5a1 1 0 0 0 1 1Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.442 12.606c.434-1.522 1.391-3.25 2.502-3.25 1.11 0 2.067 1.728 2.501 3.25m-2.501-3.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m11.343 4.28.639.555.724-.436.132.835.836.132-.436.725.555.638-.8.275.015.846-.79-.304-.531.658-.41-.74-.83.162.162-.83-.74-.41.657-.532-.303-.79.845.015.275-.8Z"
        stroke={theme.color[color]}
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoVoter16;
