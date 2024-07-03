import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWallet16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.55 3.335c0-.434.351-.785.785-.785h7.424c.55 0 .997.446.997.997v.573H3.335a.785.785 0 0 1-.785-.785Zm10.606.212v.573h.997a.7.7 0 0 1 .7.7v7.636a2.397 2.397 0 0 1-2.397 2.397H3.547a2.397 2.397 0 0 1-2.397-2.397V3.547c0-.026.001-.051.004-.077a2.185 2.185 0 0 1 2.18-2.32h7.425a2.397 2.397 0 0 1 2.397 2.397ZM2.55 5.375v7.081c0 .55.446.997.997.997h8.91c.55 0 .996-.446.996-.997V5.52H3.335a2.18 2.18 0 0 1-.785-.145Zm8.846 3.55a.076.076 0 1 0 0-.15.076.076 0 0 0 0 .15Zm-.925-.075a.924.924 0 1 1 1.849 0 .924.924 0 0 1-1.849 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWallet16;
