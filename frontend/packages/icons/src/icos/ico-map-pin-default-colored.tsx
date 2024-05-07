import React from 'react';

import type { IconProps } from '../types';

const IcoMapPinDefault = ({
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
      d="M.5 12C.5 5.61 5.61.5 12 .5S23.5 5.61 23.5 12c0 3.19-1.273 6.09-3.413 9.218-1.607 2.348-3.673 4.785-6.015 7.547-.67.79-1.362 1.607-2.072 2.455-.71-.848-1.403-1.665-2.072-2.455-2.342-2.762-4.408-5.199-6.015-7.547C1.773 18.09.5 15.19.5 12Z"
      fill="#fff"
      stroke="#E2E2E2"
    />
  </svg>
);
export default IcoMapPinDefault;
