import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarningSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.584 4.42a.652.652 0 0 0-1.166 0l-3.296 6.574a.653.653 0 0 0 .583.945h6.589c.485 0 .8-.511.583-.945L8.584 4.42Zm-2.24-.538c.684-1.363 2.63-1.363 3.313 0l3.293 6.574a1.853 1.853 0 0 1-1.656 2.683H4.705a1.853 1.853 0 0 1-1.656-2.683l3.296-6.574ZM8 6.046a.7.7 0 0 1 .7.7v1.252a.7.7 0 1 1-1.4 0V6.746a.7.7 0 0 1 .7-.7ZM8 11.2a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWarningSmall16;
