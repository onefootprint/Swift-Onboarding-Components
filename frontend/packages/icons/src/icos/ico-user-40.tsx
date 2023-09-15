import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoUser40 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.536 12.351a4.461 4.461 0 1 1 8.923 0 4.461 4.461 0 0 1-8.923 0Zm4.461-7.961a7.961 7.961 0 1 0 0 15.923 7.961 7.961 0 0 0 0-15.923ZM8.853 30.863c.624-1.181 1.646-2.48 3.342-3.493 1.698-1.013 4.175-1.802 7.802-1.802 3.628 0 6.105.789 7.803 1.802 1.696 1.013 2.718 2.311 3.342 3.493.102.193.108.324.1.403a.615.615 0 0 1-.143.316c-.205.257-.647.52-1.254.52H10.15c-.607 0-1.05-.263-1.254-.52a.615.615 0 0 1-.143-.316c-.009-.08-.002-.21.1-.403Zm11.144-8.795c-4.147 0-7.266.906-9.596 2.297s-3.768 3.206-4.643 4.864c-.853 1.614-.573 3.311.4 4.534.927 1.164 2.417 1.84 3.992 1.84h19.695c1.575 0 3.064-.676 3.991-1.84.974-1.223 1.253-2.92.4-4.534-.875-1.658-2.312-3.473-4.642-4.864-2.33-1.39-5.45-2.297-9.597-2.297Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUser40;
