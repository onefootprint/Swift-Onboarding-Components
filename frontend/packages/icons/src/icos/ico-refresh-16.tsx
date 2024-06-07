import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoRefresh16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.823 2.27a.7.7 0 1 0-.937-1.04L4.731 3.17a.7.7 0 0 0 0 1.04l2.155 1.94a.7.7 0 1 0 .937-1.04l-.8-.72H9.08a4.473 4.473 0 0 1 4.473 4.473v.216a.7.7 0 1 0 1.4 0v-.216A5.873 5.873 0 0 0 9.08 2.99H7.023l.8-.72Zm1.293 7.582a.7.7 0 1 0-.937 1.04l.8.72H6.923A4.473 4.473 0 0 1 2.45 7.14v-.216a.7.7 0 1 0-1.4 0v.216a5.873 5.873 0 0 0 5.873 5.873H8.98l-.8.72a.7.7 0 0 0 .937 1.04l2.155-1.94a.7.7 0 0 0 0-1.04l-2.155-1.94Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoRefresh16;
