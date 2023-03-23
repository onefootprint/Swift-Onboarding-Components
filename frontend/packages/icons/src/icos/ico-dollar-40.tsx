import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDollar40 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={56}
      height={56}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <rect width={56} height={56} rx={2} fill="#fff" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 27.998c0-7.455 6.043-13.498 13.498-13.498 7.455 0 13.498 6.043 13.498 13.498 0 7.455-6.043 13.498-13.498 13.498-7.455 0-13.498-6.043-13.498-13.498ZM27.998 11C18.61 11 11 18.61 11 27.998c0 9.388 7.61 16.998 16.998 16.998 9.388 0 16.998-7.61 16.998-16.998C44.996 18.61 37.386 11 27.998 11Zm1.5 8.06v.603h3.232a1.5 1.5 0 0 1 0 3h-6.046a1.918 1.918 0 1 0 0 3.835h2.629a4.918 4.918 0 0 1 .185 9.832v.607a1.5 1.5 0 1 1-3 0v-.603h-3.232a1.5 1.5 0 0 1 0-3h6.047a1.918 1.918 0 0 0 0-3.836h-2.63a4.918 4.918 0 0 1-.185-9.832v-.606a1.5 1.5 0 1 1 3 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDollar40;
