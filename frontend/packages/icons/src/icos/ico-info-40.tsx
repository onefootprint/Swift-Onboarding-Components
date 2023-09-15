import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoInfo40 = ({
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
        d="M7.5 20c0-6.904 5.596-12.5 12.5-12.5 6.902 0 12.498 5.596 12.498 12.5 0 6.902-5.596 12.498-12.499 12.498C13.096 32.498 7.5 26.902 7.5 20ZM20 4C11.162 4 4 11.163 4 20c0 8.835 7.163 15.998 16 15.998 8.835 0 15.998-7.163 15.998-15.999S28.835 4 20 4Zm-.084 9.952a.066.066 0 1 0 0 .133.066.066 0 0 0 0-.133Zm-1.733.067a1.733 1.733 0 1 1 3.466 0 1.733 1.733 0 0 1-3.466 0Zm1.816 6.696c.69 0 1.25.56 1.25 1.25v3.93a1.25 1.25 0 0 1-2.5 0v-3.93c0-.69.56-1.25 1.25-1.25Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoInfo40;
