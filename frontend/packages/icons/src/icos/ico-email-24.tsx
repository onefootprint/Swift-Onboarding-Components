import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmail24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 5A2.75 2.75 0 0 0 4 7.75v8.5A2.75 2.75 0 0 0 6.75 19h10.5A2.75 2.75 0 0 0 20 16.25v-8.5A2.75 2.75 0 0 0 17.25 5H6.75Zm-.112 1.505c.037-.003.074-.005.112-.005h10.5c.038 0 .075.002.112.005L12 11.249 6.638 6.505ZM5.52 7.52a1.257 1.257 0 0 0-.021.23v8.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.079-.007-.155-.021-.23l-5.982 5.292a.75.75 0 0 1-.994 0L5.521 7.52Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmail24;
