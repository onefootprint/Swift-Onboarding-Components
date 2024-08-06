import React from 'react';
import type { IconProps } from '../types';
const IcoDiners16 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
        <path d="M.29 8.035a6.677 6.677 0 1 1 13.353 0 6.677 6.677 0 0 1-13.353 0Z" fill="#FFFFFE" />
        <path
          d="M11.004 7.903a4.017 4.017 0 0 0-2.578-3.745v7.49a4.017 4.017 0 0 0 2.578-3.745Zm-5.45 3.744V4.159a4.02 4.02 0 0 0-2.576 3.744 4.019 4.019 0 0 0 2.576 3.744ZM6.99 1.572a6.332 6.332 0 0 0 0 12.66 6.33 6.33 0 0 0 0-12.66ZM6.975 14.83C3.15 14.848 0 11.75 0 7.975 0 3.852 3.15 1 6.975 1h1.793C12.55 1 16 3.85 16 7.975c0 3.772-3.45 6.855-7.232 6.855H6.975Z"
          fill="#0069AA"
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
export default IcoDiners16;
