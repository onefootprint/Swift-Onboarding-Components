import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M7.786 1.046a.464.464 0 0 1 .403 0l6.527 3.137c.176.084.28.264.255.457C14.745 6.41 13.37 15 7.987 15 2.606 15 1.23 6.41 1.004 4.64a.443.443 0 0 1 .255-.457l6.527-3.137Zm2.68 7.861H9.334c-.781 0-1.415.634-1.415 1.416v1.132H5.94V4.661h4.527v1.285a1.132 1.132 0 1 0 0 1.96v1.001Z"
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
export default IcoFootprintShield16;
