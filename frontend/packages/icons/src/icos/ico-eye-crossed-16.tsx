import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoEyeCrossed16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
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
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.304.705a.7.7 0 0 1 0 .99L1.695 15.305a.7.7 0 0 1-.99-.99l1.96-1.961A8.562 8.562 0 0 1 1.042 9.94C.69 9.16.5 8.427.5 8.005c0-.366.14-.947.386-1.57a8.728 8.728 0 0 1 1.23-2.147c1.16-1.482 3.05-2.85 5.889-2.85 1.766 0 3.177.532 4.273 1.303L14.314.705a.7.7 0 0 1 .99 0Zm-9.72 8.73-1.928 1.929a7.17 7.17 0 0 1-1.338-1.999c-.32-.708-.418-1.228-.418-1.36 0-.104.065-.491.288-1.056a7.33 7.33 0 0 1 1.03-1.798c.952-1.216 2.464-2.312 4.787-2.312 1.354 0 2.423.37 3.265.91L9.436 5.584a2.813 2.813 0 0 0-3.852 3.852Zm1.058-1.058 1.371-1.37.364-.365a1.411 1.411 0 0 0-1.734 1.734Zm7.272-2.878a.7.7 0 0 1 .937.32c.224.458.385.888.491 1.252.103.35.167.683.167.934 0 .365-.14.946-.386 1.57a8.729 8.729 0 0 1-1.229 2.146c-1.16 1.482-3.05 2.85-5.89 2.85a7.852 7.852 0 0 1-2.06-.265.7.7 0 1 1 .366-1.351 6.455 6.455 0 0 0 1.695.216c2.323 0 3.834-1.096 4.786-2.313a7.326 7.326 0 0 0 1.03-1.798c.223-.564.288-.952.288-1.055 0-.055-.022-.24-.11-.541a6.576 6.576 0 0 0-.405-1.029.7.7 0 0 1 .32-.936Z"
          fill={theme.color[color]}
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
export default IcoEyeCrossed16;
