import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShield40 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.717 4.943a1.75 1.75 0 0 0-1.431 0L5.819 10.98a1.75 1.75 0 0 0-1.03 1.48l1.746.117a212.142 212.142 0 0 0-1.746-.115v.002l-.001.005-.001.016-.003.055-.01.197c-.007.167-.015.408-.02.71-.01.605-.006 1.46.048 2.486.105 2.04.408 4.794 1.212 7.578.801 2.772 2.133 5.691 4.377 7.935 2.29 2.29 5.434 3.778 9.61 3.778 4.177 0 7.322-1.489 9.611-3.778 2.244-2.244 3.576-5.163 4.377-7.935.804-2.784 1.107-5.539 1.213-7.578.053-1.025.057-1.881.047-2.486a26.487 26.487 0 0 0-.03-.907l-.003-.055v-.016l-.001-.005v-.002s0-.002-1.747.115l1.746-.117a1.75 1.75 0 0 0-1.03-1.48L20.717 4.943ZM8.297 15.751a34.041 34.041 0 0 1-.046-2.026l11.75-5.267 11.751 5.267c.004.521-.004 1.214-.046 2.026-.097 1.88-.375 4.348-1.08 6.789-.708 2.452-1.814 4.757-3.489 6.431-1.628 1.629-3.882 2.753-7.135 2.753-3.254 0-5.507-1.124-7.136-2.753-1.675-1.674-2.78-3.979-3.49-6.431-.704-2.44-.982-4.91-1.08-6.789Zm17.1.955a1.5 1.5 0 0 0-2.432-1.757l-4.906 6.793-1.085-1.302a1.5 1.5 0 1 0-2.304 1.92l2.322 2.787a1.5 1.5 0 0 0 2.368-.082l6.037-8.36Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoShield40;
