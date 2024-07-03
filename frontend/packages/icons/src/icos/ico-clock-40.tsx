import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClock40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <rect width={40} height={40} rx={2.5} fill="#fff" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.625 20c0-6.282 5.093-11.375 11.375-11.375S31.375 13.718 31.375 20 26.282 31.375 20 31.375 8.625 26.282 8.625 20ZM20 6C12.268 6 6 12.268 6 20s6.268 14 14 14 14-6.268 14-14S27.732 6 20 6Zm-1.313 7V20.544l.385.384 3.5 3.5 1.856-1.856-3.116-3.116V13h-2.625Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClock40;
