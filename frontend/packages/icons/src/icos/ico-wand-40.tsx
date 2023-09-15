import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoWand40 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={36}
      height={36}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        d="M12.476 12.157a2.225 2.225 0 0 0 0 3.146l3.155 3.155 3.146-3.146-3.155-3.155a2.226 2.226 0 0 0-3.146 0ZM3.309 13.114h3.375-3.375Zm2.965-7.159 2.387 2.386-2.387-2.386Zm7.16-2.966v3.375V2.99Zm7.159 2.966-2.387 2.386 2.387-2.386ZM8.66 17.887l-2.387 2.386 2.387-2.386Z"
        fill={theme.color[color]}
      />
      <path
        d="M3.309 13.114h3.375m-.41-7.159 2.387 2.386m4.773-5.352v3.375m7.159-.409-2.387 2.386m-9.545 9.546-2.387 2.386m6.195-8.123a2.216 2.216 0 0 1 3.134 0l15.67 15.67a2.216 2.216 0 1 1-3.134 3.133l-15.67-15.669a2.216 2.216 0 0 1 0-3.134Zm.007.007a2.225 2.225 0 0 0 0 3.146l3.155 3.155 3.146-3.146-3.155-3.155a2.226 2.226 0 0 0-3.146 0Z"
        stroke={theme.color[color]}
        strokeWidth={3}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoWand40;
