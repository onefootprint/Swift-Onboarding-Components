import React from 'react';

import type { IconProps } from '../types';

const IcoGoogle24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => (
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
      d="M19.844 10.433H19.2V10.4H12v3.2h4.521A4.798 4.798 0 0 1 7.2 12 4.8 4.8 0 0 1 12 7.2c1.224 0 2.337.462 3.184 1.216l2.263-2.263A7.963 7.963 0 0 0 12 4a8 8 0 1 0 7.844 6.433Z"
      fill="#FFC107"
    />
    <path
      d="m4.922 8.276 2.629 1.928A4.798 4.798 0 0 1 12 7.2c1.224 0 2.337.462 3.184 1.216l2.263-2.263A7.963 7.963 0 0 0 12 4a7.995 7.995 0 0 0-7.078 4.276Z"
      fill="#FF3D00"
    />
    <path
      d="M12 20c2.066 0 3.944-.79 5.364-2.077l-2.476-2.095A4.764 4.764 0 0 1 12 16.8a4.798 4.798 0 0 1-4.513-3.178l-2.609 2.01A7.994 7.994 0 0 0 12 20Z"
      fill="#4CAF50"
    />
    <path
      d="M19.844 10.433H19.2V10.4H12v3.2h4.521a4.816 4.816 0 0 1-1.635 2.228h.002l2.476 2.095C17.188 18.082 20 16 20 12c0-.536-.055-1.06-.156-1.567Z"
      fill="#1976D2"
    />
  </svg>
);
export default IcoGoogle24;
