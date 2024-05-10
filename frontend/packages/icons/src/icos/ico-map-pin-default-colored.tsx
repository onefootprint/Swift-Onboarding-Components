import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoMapPinDefault = ({
  'aria-label': ariaLabel,
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();

  return (
    <svg
      width={36}
      height={48}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored
    >
      <path
        d="M.5 18C.5 8.276 8.276.5 18 .5S35.5 8.276 35.5 18c0 4.857-1.94 9.257-5.163 13.968-2.418 3.534-5.53 7.204-9.045 11.35A728.625 728.625 0 0 0 18 47.22a728.625 728.625 0 0 0-3.292-3.902c-3.516-4.146-6.627-7.816-9.045-11.35C2.439 27.257.5 22.857.5 18Z"
        fill={theme.backgroundColor.primary}
        stroke={theme.borderColor.tertiary}
      />
    </svg>
  );
};

export default IcoMapPinDefault;
