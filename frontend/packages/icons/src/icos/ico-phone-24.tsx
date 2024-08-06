import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPhone24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M9.73 5.794a.833.833 0 0 0-.745-.46H6.167a.833.833 0 0 0-.833.833V7c0 6.443 5.223 11.667 11.666 11.667h.834c.46 0 .833-.373.833-.834v-2.818a.833.833 0 0 0-.46-.745l-2.336-1.168a.833.833 0 0 0-.962.156l-.437.437a.793.793 0 0 1-.893.17c-1.622-.754-2.69-1.822-3.444-3.444a.793.793 0 0 1 .17-.893l.437-.437a.833.833 0 0 0 .156-.962L9.73 5.794Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoPhone24;
