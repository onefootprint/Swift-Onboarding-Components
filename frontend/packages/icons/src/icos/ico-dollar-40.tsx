import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoDollar40 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 19.998C6.5 12.543 12.543 6.5 19.998 6.5c7.455 0 13.498 6.043 13.498 13.498 0 7.455-6.043 13.498-13.498 13.498-7.455 0-13.498-6.043-13.498-13.498ZM19.998 3C10.61 3 3 10.61 3 19.998c0 9.388 7.61 16.998 16.998 16.998 9.388 0 16.998-7.61 16.998-16.998C36.996 10.61 29.386 3 19.998 3Zm1.5 8.06v.603h3.232a1.5 1.5 0 0 1 0 3h-6.046a1.918 1.918 0 1 0 0 3.835h2.629a4.918 4.918 0 0 1 .185 9.832v.607a1.5 1.5 0 1 1-3 0v-.603h-3.232a1.5 1.5 0 0 1 0-3h6.047a1.918 1.918 0 0 0 0-3.836h-2.63a4.918 4.918 0 0 1-.185-9.832v-.606a1.5 1.5 0 1 1 3 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDollar40;
