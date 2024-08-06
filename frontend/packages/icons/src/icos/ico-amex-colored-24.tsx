import React from 'react';
import type { IconProps } from '../types';
const IcoAmex24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
        d="m5.327 11.976-.713-1.736-.708 1.736h1.42Zm6.834 1.88-.004-3.412-1.51 3.411h-.914L8.22 10.441v3.414H6.102l-.4-.971H3.535l-.404.971H2L3.864 9.5h1.547l1.77 4.124V9.5h1.7l1.362 2.955L11.495 9.5h1.733v4.355h-1.067Zm2.724-.892v-.867h2.285v-.888h-2.285v-.792h2.61l1.139 1.27-1.19 1.277h-2.56Zm7.053.908h-1.352l-1.282-1.442-1.332 1.442h-4.124V9.516h4.187l1.28 1.428 1.325-1.428H22l-2.023 2.178 1.961 2.178Z"
        fill="#002663"
      />
    </svg>
  );
};
export default IcoAmex24;
