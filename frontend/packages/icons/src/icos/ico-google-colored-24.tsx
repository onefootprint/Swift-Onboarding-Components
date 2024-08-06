import React from 'react';
import type { IconProps } from '../types';
const IcoGoogle24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
      data-colored={true}
      viewBox="0 0 24 24"
    >
      <path
        d="M18.537 10.694H18v-.027h-6v2.666h3.768A3.998 3.998 0 0 1 8 12a4 4 0 0 1 4-4c1.02 0 1.947.385 2.654 1.013l1.886-1.886A6.636 6.636 0 0 0 12 5.333a6.667 6.667 0 1 0 6.537 5.361Z"
        fill="#FFC107"
      />
      <path
        d="m6.102 8.897 2.19 1.606A3.998 3.998 0 0 1 12 8c1.02 0 1.947.385 2.653 1.013l1.886-1.886a6.636 6.636 0 0 0-4.54-1.794 6.663 6.663 0 0 0-5.897 3.564Z"
        fill="#FF3D00"
      />
      <path
        d="M12 18.667a6.635 6.635 0 0 0 4.47-1.731l-2.064-1.746A3.97 3.97 0 0 1 12 16a3.998 3.998 0 0 1-3.761-2.649l-2.174 1.675A6.661 6.661 0 0 0 12 18.666Z"
        fill="#4CAF50"
      />
      <path
        d="M18.537 10.694H18v-.027h-6v2.666h3.768a4.013 4.013 0 0 1-1.363 1.857h.001l2.064 1.746c-.146.132 2.197-1.603 2.197-4.936a6.71 6.71 0 0 0-.13-1.306Z"
        fill="#1976D2"
      />
    </svg>
  );
};
export default IcoGoogle24;
