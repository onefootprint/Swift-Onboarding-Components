import React from 'react';
import type { IconProps } from '../types';
const IcoDiners24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.398 12.163a9.18 9.18 0 1 1 18.36 0 9.18 9.18 0 1 1-18.36 0Z"
        fill="#FFFFFE"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.13 11.982a5.523 5.523 0 0 0-3.544-5.15v10.3a5.523 5.523 0 0 0 3.544-5.15ZM8.636 17.13V6.832a5.528 5.528 0 0 0-3.541 5.149 5.526 5.526 0 0 0 3.541 5.148Zm1.976-13.854a8.706 8.706 0 0 0-8.703 8.706 8.705 8.705 0 1 0 8.704-8.705Zm-.021 18.23C5.331 21.533 1 17.27 1 12.082c0-5.67 4.33-9.592 9.591-9.591h2.466C18.255 2.489 23 6.41 23 12.081c0 5.187-4.745 9.426-9.944 9.426h-2.465Z"
        fill="#0069AA"
      />
    </svg>
  );
};
export default IcoDiners24;
