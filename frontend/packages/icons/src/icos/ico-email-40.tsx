import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmail40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.709 5.05A5.799 5.799 0 0 0 2.91 10.85v18.27a5.799 5.799 0 0 0 5.799 5.799h22.569a5.799 5.799 0 0 0 5.798-5.8v-18.27a5.799 5.799 0 0 0-5.798-5.798H8.708Zm-.5 3.044c.162-.029.33-.044.5-.044h22.569c.17 0 .337.015.499.044L19.993 18.52 8.21 8.094ZM6 10.144c-.058.226-.089.462-.089.705v18.27a2.799 2.799 0 0 0 2.799 2.799h22.569a2.799 2.799 0 0 0 2.798-2.8v-18.27c0-.242-.03-.478-.089-.703l-13 11.5a1.5 1.5 0 0 1-1.988 0l-13-11.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmail40;
