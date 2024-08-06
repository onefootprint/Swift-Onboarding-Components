import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmojiHappy16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M9.886 9.886a2.667 2.667 0 0 1-3.771 0M12.36 3.64a6.167 6.167 0 1 1-8.721 8.72 6.167 6.167 0 0 1 8.72-8.72ZM6.5 6.333c0 .276-.15.5-.334.5-.184 0-.333-.224-.333-.5s.149-.5.333-.5c.184 0 .333.224.333.5Zm3.666 0c0 .276-.15.5-.333.5-.185 0-.334-.224-.334-.5s.15-.5.334-.5c.184 0 .333.224.333.5Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path fill={theme.color[color]} d="M9 6h1.5v1H9zM5.5 6H7v1H5.5z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoEmojiHappy16;
