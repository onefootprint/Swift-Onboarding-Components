import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheck16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.831 3.8a.646.646 0 0 0-.444.196l-6.645 6.646-2.126-2.127a.646.646 0 1 0-.913.913l2.582 2.583a.646.646 0 0 0 .913 0L13.3 4.909a.646.646 0 0 0-.469-1.109Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheck16;
