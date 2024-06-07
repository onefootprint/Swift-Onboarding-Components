import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLinkedin16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.727 1H2.273C1.57 1 1 1.57 1 2.273v11.454C1 14.431 1.57 15 2.273 15h11.454c.704 0 1.273-.57 1.273-1.273V2.273C15 1.57 14.43 1 13.727 1ZM5.425 12.454H3.548v-6.04h1.877v6.04Zm-.957-6.903a1.094 1.094 0 1 1 0-2.19 1.094 1.094 0 0 1 0 2.19Zm7.99 6.903H10.58V9.518c0-.7-.013-1.602-.975-1.602-.977 0-1.127.763-1.127 1.551v2.989H6.603v-6.04h1.8v.825h.026c.25-.475.863-.976 1.776-.976 1.9 0 2.252 1.251 2.252 2.878v3.313Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLinkedin16;
