import React from 'react';
import type { IconProps } from '../types';
const IcoGoogle16 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
      data-colored={true}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M14.864 6.63H14.3V6.6H8v2.8h3.956A4.198 4.198 0 0 1 3.8 8 4.2 4.2 0 0 1 8 3.8c1.07 0 2.045.404 2.786 1.064l1.98-1.98A6.968 6.968 0 0 0 8 1a7 7 0 1 0 6.864 5.63Z"
          fill="#FFC107"
        />
        <path
          d="m1.807 4.742 2.3 1.686A4.198 4.198 0 0 1 8 3.8c1.07 0 2.045.404 2.786 1.064l1.98-1.98A6.968 6.968 0 0 0 8 1a6.996 6.996 0 0 0-6.193 3.742Z"
          fill="#FF3D00"
        />
        <path
          d="M8 15a6.967 6.967 0 0 0 4.693-1.817l-2.166-1.833A4.168 4.168 0 0 1 8 12.2a4.198 4.198 0 0 1-3.95-2.781l-2.282 1.759A6.995 6.995 0 0 0 8 15Z"
          fill="#4CAF50"
        />
        <path
          d="M14.864 6.63H14.3V6.6H8v2.8h3.956a4.214 4.214 0 0 1-1.43 1.95l2.167 1.832C12.54 13.322 15 11.5 15 8c0-.47-.048-.927-.136-1.37Z"
          fill="#1976D2"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoGoogle16;
