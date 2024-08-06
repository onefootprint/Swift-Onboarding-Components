import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmojiHappy40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
          d="M24.714 24.714a6.667 6.667 0 0 1-9.428 0m.13-8.88v-.017m9.167.016v-.016m6.024-6.424c5.858 5.858 5.858 15.356 0 21.213-5.858 5.858-15.356 5.858-21.214 0-5.857-5.857-5.857-15.355 0-21.213 5.858-5.857 15.356-5.857 21.213 0Zm-14.774 6.44c0 .46-.186.834-.416.834-.23 0-.417-.373-.417-.834 0-.46.187-.833.417-.833.23 0 .416.373.416.833Zm9.167 0c0 .46-.186.834-.417.834-.23 0-.416-.373-.416-.834 0-.46.186-.833.416-.833.23 0 .417.373.417.833Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoEmojiHappy40;
