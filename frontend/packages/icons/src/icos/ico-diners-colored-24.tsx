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
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.166 11.727a7.65 7.65 0 1 1 15.3 0 7.65 7.65 0 0 1-15.3 0Z"
        fill="#FFFFFE"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.442 11.577a4.602 4.602 0 0 0-2.953-4.292v8.583a4.602 4.602 0 0 0 2.953-4.291Zm-6.245 4.29V7.285a4.607 4.607 0 0 0-2.951 4.29 4.605 4.605 0 0 0 2.951 4.29Zm1.647-11.545a7.253 7.253 0 1 0 0 14.508 7.253 7.253 0 0 0 0-14.508Zm-.018 15.192c-4.384.02-7.993-3.531-7.993-7.855 0-4.725 3.609-7.993 7.993-7.992h2.054c4.333-.001 8.287 3.266 8.287 7.992 0 4.322-3.954 7.855-8.287 7.855h-2.054Z"
        fill="#0069AA"
      />
    </svg>
  );
};
export default IcoDiners24;
