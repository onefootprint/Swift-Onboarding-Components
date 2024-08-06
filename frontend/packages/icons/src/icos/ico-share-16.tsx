import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShare16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.167 2.5h-2.6c-.374 0-.56 0-.703.073a.667.667 0 0 0-.291.291c-.073.143-.073.33-.073.703v8.866c0 .374 0 .56.073.703a.666.666 0 0 0 .291.291c.143.073.33.073.703.073h8.866c.374 0 .56 0 .703-.073a.666.666 0 0 0 .291-.291c.073-.143.073-.33.073-.703v-2.6M9.167 2.5H13.5m0 0v4.333m0-4.333L7.333 8.667" />
        <path d="M6.167 2.5h-2.6c-.374 0-.56 0-.703.073a.667.667 0 0 0-.291.291c-.073.143-.073.33-.073.703v8.866c0 .374 0 .56.073.703a.666.666 0 0 0 .291.291c.143.073.33.073.703.073h8.866c.374 0 .56 0 .703-.073a.666.666 0 0 0 .291-.291c.073-.143.073-.33.073-.703v-2.6M9.167 2.5H13.5m0 0v4.333m0-4.333L7.333 8.667" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoShare16;
