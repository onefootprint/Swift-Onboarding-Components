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
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.48 6.52A7.75 7.75 0 0 0 6.52 17.48l-.53.53.53-.53A7.75 7.75 0 0 0 17.48 6.52ZM5.46 5.46a9.25 9.25 0 1 1 13.08 13.08A9.25 9.25 0 1 1 5.46 5.46ZM8.523 8.8c.173-.26.493-.536.949-.536.456 0 .776.277.949.535.176.264.26.586.26.904 0 .317-.084.639-.26.903-.173.259-.493.536-.949.536-.456 0-.776-.277-.949-.536a1.636 1.636 0 0 1-.26-.903c0-.318.084-.64.26-.904Zm5.054 0c.173-.26.493-.536.949-.536.456 0 .776.277.949.535.176.264.26.586.26.904 0 .317-.084.639-.26.903-.173.259-.493.536-.949.536-.456 0-.776-.277-.949-.536a1.636 1.636 0 0 1-.26-.903c0-.318.084-.64.26-.904Zm-4.707 5.269a.75.75 0 0 1 1.06 0 2.926 2.926 0 0 0 4.138 0 .75.75 0 0 1 1.06 1.06 4.426 4.426 0 0 1-6.258 0 .75.75 0 0 1 0-1.06Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(2 2)" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoEmojiHappy24;
