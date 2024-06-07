import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSmartphone216 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M7.773 11.527a.75.75 0 0 0 0 1.5h.45a.75.75 0 1 0 0-1.5h-.45Z" fill={theme.color[color]} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.071.77A2.501 2.501 0 0 0 2.57 3.271v9.457a2.501 2.501 0 0 0 2.501 2.501h5.854a2.501 2.501 0 0 0 2.502-2.501V3.27A2.501 2.501 0 0 0 10.925.77H5.071ZM3.97 3.271c0-.608.493-1.101 1.101-1.101h5.854c.608 0 1.101.493 1.101 1.101v9.457c0 .608-.492 1.101-1.1 1.101H5.07a1.101 1.101 0 0 1-1.101-1.101V3.27Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSmartphone216;
