import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoForbid40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.535 10.414A12.098 12.098 0 0 1 20 7.85c6.711 0 12.15 5.44 12.15 12.15 0 2.815-.956 5.406-2.563 7.466L12.535 10.414Zm-2.121 2.12A12.098 12.098 0 0 0 7.85 20c0 6.711 5.44 12.15 12.15 12.15 2.815 0 5.406-.956 7.466-2.563L10.414 12.535ZM20 4.85C11.633 4.85 4.85 11.633 4.85 20c0 8.368 6.783 15.15 15.15 15.15 8.368 0 15.15-6.782 15.15-15.15 0-8.367-6.782-15.15-15.15-15.15Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoForbid40;
