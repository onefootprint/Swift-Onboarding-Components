import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMountain24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.689 4.453a.75.75 0 0 0-1.364-.03L8.99 11.332c-1.04.003-2.077.576-2.54 1.718l-2.395 5.92A.75.75 0 0 0 4.75 20h14.5a.75.75 0 0 0 .689-1.047l-6.25-14.5ZM12.137 18.5H5.863l1.978-4.888c.422-1.042 1.896-1.042 2.318 0l1.978 4.888Zm1.618 0h4.355L12.961 6.555 10.46 11.74a2.71 2.71 0 0 1 1.09 1.31l2.207 5.451Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMountain24;
