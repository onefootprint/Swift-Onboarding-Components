import React from 'react';
import type { IconProps } from '../types';
const IcoAmex16 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="m2.661 7.98-.57-1.388-.567 1.389h1.137ZM8.13 9.485l-.003-2.729-1.208 2.73h-.731L4.976 6.752v2.731H3.282l-.32-.777H1.228l-.323.777H0L1.491 6H2.73l1.416 3.299V6h1.36l1.09 2.364 1-2.364h1.387v3.484H8.13Zm2.179-.713v-.693h1.828v-.711h-1.828v-.634h2.088l.91 1.016-.95 1.022h-2.048Zm5.643.727h-1.083l-1.025-1.154-1.066 1.154H9.478V6.013h3.35l1.025 1.142 1.059-1.143H16l-1.618 1.743 1.569 1.743Z"
          fill="#002663"
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
export default IcoAmex16;
