import React from 'react';

import type { IconProps } from '../types';

const IcoMapPinSelected = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => (
  <svg
    width={36}
    height={48}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    aria-label={ariaLabel}
    className={className}
    role="img"
    data-colored
  >
    <path d="M18 0C8 0 0 8 0 18s8 18 18 30c10-12 18-20 18-30S28 0 18 0Z" fill="#4A24DB" />
  </svg>
);
export default IcoMapPinSelected;
