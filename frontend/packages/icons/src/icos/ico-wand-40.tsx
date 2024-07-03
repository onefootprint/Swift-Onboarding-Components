import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWand40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.296 14.296a2.472 2.472 0 0 0 0 3.496l3.505 3.505 3.497-3.496-3.506-3.505a2.47 2.47 0 0 0-3.496 0ZM4.11 15.36h3.75-3.75Zm3.295-7.955 2.652 2.652-2.652-2.652ZM15.36 4.11v3.75-3.75Zm7.955 3.295-2.652 2.652 2.652-2.652ZM10.057 20.663l-2.652 2.652 2.652-2.652Z"
        fill={theme.color[color]}
      />
      <path
        d="M4.11 15.36h3.75m-.455-7.955 2.652 2.652M15.36 4.11v3.75m7.955-.455-2.652 2.652M10.057 20.663l-2.652 2.652m6.884-9.026a2.462 2.462 0 0 1 3.482 0L35.18 31.7a2.462 2.462 0 1 1-3.482 3.482l-17.41-17.41a2.462 2.462 0 0 1 0-3.482Zm.007.007a2.472 2.472 0 0 0 0 3.496l3.505 3.505 3.497-3.496-3.506-3.505a2.47 2.47 0 0 0-3.496 0Z"
        stroke={theme.color[color]}
        strokeWidth={3}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoWand40;
