import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.974 3.314a.974.974 0 0 1 .961-.814h6.132c.476 0 .883.344.961.814l.477 2.86H3.498l.476-2.86ZM4.935 1c-1.21 0-2.242.874-2.44 2.068L1.88 6.755A2.47 2.47 0 0 0 1 8.648v3.017c0 .89.722 1.613 1.612 1.613h.112v.974a.75.75 0 0 0 1.5 0v-.975h7.553v.975a.75.75 0 0 0 1.5 0v-.975h.113c.89 0 1.612-.721 1.612-1.612V8.648c0-.76-.342-1.439-.88-1.893l-.614-3.687A2.474 2.474 0 0 0 11.067 1H4.935ZM2.5 8.648c0-.539.436-.975.974-.975h9.054c.538 0 .974.436.974.975v3.017c0 .062-.05.113-.112.113H2.612a.112.112 0 0 1-.112-.113V8.648Zm2.121 1.077a.069.069 0 1 1-.138 0 .069.069 0 0 1 .138 0Zm-.069-.93a.931.931 0 1 0 0 1.861.931.931 0 0 0 0-1.862Zm6.898 1a.069.069 0 1 0 0-.139.069.069 0 0 0 0 .138Zm-.931-.07a.931.931 0 1 1 1.862 0 .931.931 0 0 1-1.862 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCar16;
