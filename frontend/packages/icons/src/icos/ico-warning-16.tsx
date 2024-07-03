import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarning16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8.937 2.947a1.045 1.045 0 0 0-1.87 0l-4.593 9.161a1.045 1.045 0 0 0 .935 1.514h9.182c.777 0 1.283-.819.935-1.514l-4.59-9.16ZM5.816 2.32c.902-1.8 3.47-1.799 4.372.001l4.59 9.161c.814 1.626-.369 3.541-2.187 3.541H3.409c-1.82 0-3.002-1.915-2.186-3.542l4.593-9.16Zm2.183 3.03a.9.9 0 0 1 .9.9v1.746a.9.9 0 1 1-1.8 0V6.249a.9.9 0 0 1 .9-.9Zm.014 6.137a.016.016 0 0 1-.004.01l-.004.002a.015.015 0 0 1-.006.001l-.005-.001a.013.013 0 0 1-.004-.003l-.003-.004a.016.016 0 0 1-.001-.005v-.006l.002-.003.002-.001.004-.003a.015.015 0 0 1 .005-.001h.004l.002.001.001.001a.012.012 0 0 1 .006.006v.006Zm-.014-.887a.886.886 0 1 0 0 1.773.886.886 0 0 0 0-1.773Z"
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
export default IcoWarning16;
