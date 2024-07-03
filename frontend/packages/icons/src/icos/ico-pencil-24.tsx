import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPencil24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M17.65 4.513a1.75 1.75 0 0 0-2.476 0L5.22 14.467a.75.75 0 0 0-.2.358l-1 4.253a.75.75 0 0 0 .902.901l4.252-1a.75.75 0 0 0 .358-.2l9.954-9.954a1.75 1.75 0 0 0 0-2.476L17.65 4.513Zm-1.415 1.06a.25.25 0 0 1 .354 0l1.837 1.837a.25.25 0 0 1 0 .354l.53.53-.53-.53-1.303 1.303-2.19-2.191 1.302-1.303-.53-.53.53.53Zm-2.363 2.364-7.44 7.44-.674 2.865 2.865-.675 7.44-7.44-2.191-2.19Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPencil24;
