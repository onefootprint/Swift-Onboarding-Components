import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDollar24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
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
      data-colored={false}
      viewBox="0 0 24 24"
    >
      <path
        d="M12 8.146v-.857m0 8.565v.857m1.855-7.28c-.37-.512-1.063-.857-1.855-.857h-.238c-1.051 0-1.903.682-1.903 1.523v.065c0 .602.424 1.151 1.097 1.42l2.088.836c.672.269 1.097.818 1.097 1.42 0 .877-.889 1.588-1.985 1.588H12c-.793 0-1.485-.345-1.855-.857M19.708 12a7.708 7.708 0 1 1-15.417 0 7.708 7.708 0 0 1 15.417 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDollar24;
