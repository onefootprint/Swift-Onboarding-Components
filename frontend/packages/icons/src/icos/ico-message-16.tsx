import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoMessage16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.45 8.219c0-1.745.713-2.902 1.735-3.645 1.051-.765 2.48-1.124 3.909-1.124 1.429 0 2.857.36 3.908 1.124 1.023.743 1.736 1.9 1.736 3.645 0 1.744-.713 2.901-1.736 3.645-1.051.764-2.48 1.123-3.908 1.123-.429 0-.86-.032-1.284-.1a2.662 2.662 0 0 0-.907.007l-2.806.526a.175.175 0 0 1-.205-.204l.23-1.224c.119-.635-.038-1.24-.262-1.729-.256-.56-.41-1.234-.41-2.044ZM8.094 2.05c-1.634 0-3.377.406-4.732 1.392C1.978 4.448 1.05 6.026 1.05 8.219c0 .992.19 1.867.537 2.627.153.333.206.635.159.888l-.23 1.224a1.575 1.575 0 0 0 1.839 1.838l2.806-.526c.128-.024.273-.024.43 0 .5.08 1.004.117 1.503.117 1.633 0 3.377-.406 4.732-1.391 1.384-1.007 2.311-2.584 2.311-4.777s-.927-3.77-2.311-4.777C11.47 2.456 9.727 2.05 8.094 2.05Zm-2.699 7.2a.975.975 0 1 0 0-1.95.975.975 0 0 0 0 1.95Zm3.675-.975a.975.975 0 1 1-1.95 0 .975.975 0 0 1 1.95 0Zm1.725.975a.975.975 0 1 0 0-1.95.975.975 0 0 0 0 1.95Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMessage16;
