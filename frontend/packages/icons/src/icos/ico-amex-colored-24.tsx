import React from 'react';

import type { IconProps } from '../types';

const IcoAmex24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    aria-label={ariaLabel}
    className={className}
    role="img"
    data-colored
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m3.992 12.351-.855-2.083-.85 2.083h1.705Zm8.201 2.255-.005-4.093-1.811 4.094H9.28l-1.816-4.098v4.098H4.923l-.48-1.166H1.842l-.485 1.165H0L2.237 9.38h1.856l2.125 4.948V9.38h2.039l1.635 3.546 1.502-3.546h2.08v5.226h-1.281Zm3.269-1.069v-1.04h2.742V11.43h-2.742v-.95h3.132l1.366 1.523-1.427 1.534h-3.071Zm8.464 1.09h-1.623l-1.539-1.731-1.598 1.73h-4.949V9.4h5.025l1.537 1.713L22.368 9.4H24l-2.428 2.614 2.354 2.614Z"
      fill="#002663"
    />
  </svg>
);
export default IcoAmex24;
