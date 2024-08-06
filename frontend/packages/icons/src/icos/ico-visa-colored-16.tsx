import React from 'react';
import type { IconProps } from '../types';
const IcoVisa16 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
          d="M7.922 5.091 6.853 10.09H5.56L6.63 5.09h1.292Zm5.44 3.227.68-1.876.392 1.876h-1.072Zm1.443 1.77H16l-1.044-4.997h-1.103a.589.589 0 0 0-.551.367l-1.94 4.63h1.358l.27-.746h1.658l.157.747Zm-3.376-1.63c.006-1.32-1.823-1.393-1.81-1.982.003-.18.174-.37.548-.419a2.441 2.441 0 0 1 1.275.224l.226-1.06A3.485 3.485 0 0 0 10.458 5c-1.277 0-2.176.679-2.184 1.652-.008.72.643 1.12 1.132 1.36.504.245.673.402.67.62-.003.336-.402.485-.773.49-.65.01-1.027-.175-1.328-.316l-.234 1.096c.302.139.86.259 1.437.265 1.359 0 2.247-.67 2.251-1.71ZM6.075 5.09 3.98 10.09H2.613L1.583 6.1c-.063-.245-.118-.335-.308-.439C.965 5.493.451 5.335 0 5.236l.03-.145h2.2c.28 0 .533.187.597.51l.545 2.892L4.716 5.09h1.359Z"
          fill="#1434CB"
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
export default IcoVisa16;
