import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTrash16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          d="m3.833 14.167-.748.048a.75.75 0 0 0 .748.702v-.75Zm8.334 0v.75a.75.75 0 0 0 .748-.702l-.748-.048ZM1.834 3.083a.75.75 0 1 0 0 1.5v-1.5Zm12.333 1.5a.75.75 0 0 0 0-1.5v1.5ZM7.25 7.167a.75.75 0 1 0-1.5 0h1.5Zm-1.5 3.666a.75.75 0 1 0 1.5 0h-1.5Zm4.5-3.666a.75.75 0 0 0-1.5 0h1.5Zm-1.5 3.666a.75.75 0 1 0 1.5 0h-1.5ZM9.857 4.02a.75.75 0 1 0 1.452-.374l-1.452.374Zm-7.439-.138.667 10.333 1.497-.097-.667-10.333-1.497.097Zm1.415 11.035h8.334v-1.5H3.834v1.5Zm9.082-.702.667-10.333-1.497-.097-.667 10.333 1.497.097Zm-.081-11.132H3.167v1.5h9.667v-1.5Zm-11 1.5h1.333v-1.5H1.834v1.5Zm11 0h1.333v-1.5h-1.333v1.5ZM5.75 7.167v3.666h1.5V7.167h-1.5Zm3 0v3.666h1.5V7.167h-1.5ZM8 2.583c.892 0 1.644.61 1.857 1.437l1.452-.374A3.418 3.418 0 0 0 8 1.083v1.5ZM6.144 4.02A1.918 1.918 0 0 1 8 2.583v-1.5a3.418 3.418 0 0 0-3.309 2.563l1.453.374Z"
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
export default IcoTrash16;
