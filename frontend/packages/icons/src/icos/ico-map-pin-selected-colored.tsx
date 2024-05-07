import React from 'react';

import type { IconProps } from '../types';

const IcoMapPinSelected = ({
  'aria-label': ariaLabel,
  className,
  testID,
}: IconProps) => (
  <svg
    width={24}
    height={32}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    aria-label={ariaLabel}
    className={className}
    role="img"
    data-colored
  >
    <path
      d="M12 0C5.333 0 0 5.333 0 12s5.333 12 12 20c6.667-8 12-13.333 12-20S18.667 0 12 0Z"
      fill="#4A24DB"
    />
  </svg>
);
export default IcoMapPinSelected;
