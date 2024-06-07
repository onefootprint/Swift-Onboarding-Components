import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoUpload16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.512 2.224a.7.7 0 0 0-1.026 0L5.111 4.782a.7.7 0 1 0 1.026.953l1.162-1.252v5.16a.7.7 0 0 0 1.4 0v-5.16l1.163 1.252a.7.7 0 0 0 1.026-.953L8.512 2.224ZM2.7 9.309a.7.7 0 0 1 .7.7v1.097c0 .824.668 1.493 1.493 1.493h6.213c.824 0 1.493-.669 1.493-1.493v-1.097a.7.7 0 1 1 1.4 0v1.097a2.893 2.893 0 0 1-2.893 2.893H4.893A2.893 2.893 0 0 1 2 11.106v-1.097a.7.7 0 0 1 .7-.7Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUpload16;
