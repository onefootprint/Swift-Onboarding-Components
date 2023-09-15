import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoWarning40 = ({
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
        d="M21.784 9.28c-.735-1.467-2.83-1.467-3.565 0L8.37 28.927a1.993 1.993 0 0 0 1.781 2.887h19.693a1.993 1.993 0 0 0 1.782-2.886L21.784 9.28ZM15.09 7.712c2.026-4.042 7.796-4.041 9.822.002l9.841 19.647c1.83 3.653-.826 7.954-4.911 7.954H10.15c-4.087 0-6.743-4.303-4.911-7.956l9.85-19.647Zm4.904 6.873c.92 0 1.667.747 1.667 1.667v3.743a1.667 1.667 0 1 1-3.333 0v-3.743c0-.92.746-1.667 1.666-1.667Zm-.07 11.215a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWarning40;
