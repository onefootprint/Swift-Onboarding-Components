import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmojiHappy24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.357 14.357a3.333 3.333 0 0 1-4.714 0m7.807-7.808a7.708 7.708 0 1 1-10.9 10.902 7.708 7.708 0 0 1 10.9-10.902Zm-7.325 3.368c0 .345-.187.625-.417.625-.23 0-.417-.28-.417-.625s.187-.625.417-.625c.23 0 .417.28.417.625Zm4.583 0c0 .345-.186.625-.417.625-.23 0-.416-.28-.416-.625s.186-.625.416-.625c.23 0 .417.28.417.625Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoEmojiHappy24;
