import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCopy24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.708 9.292V4.708a.417.417 0 0 0-.417-.416H4.708a.417.417 0 0 0-.417.416v9.584c0 .23.187.416.417.416h4.583m.417-5.416h9.583c.23 0 .417.186.417.416v9.584c0 .23-.186.416-.416.416H9.707a.417.417 0 0 1-.417-.416V9.708c0-.23.187-.416.417-.416Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoCopy24;
