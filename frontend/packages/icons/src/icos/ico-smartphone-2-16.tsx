import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoSmartphone216 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.071.72A2.551 2.551 0 0 0 2.52 3.271v9.457a2.551 2.551 0 0 0 2.551 2.551h5.854a2.551 2.551 0 0 0 2.551-2.551V3.27A2.551 2.551 0 0 0 10.927.72H5.07ZM4.02 3.271c0-.58.47-1.051 1.051-1.051h5.854c.58 0 1.051.47 1.051 1.051v9.457c0 .58-.47 1.051-1.05 1.051H5.07c-.58 0-1.051-.47-1.051-1.051V3.27Zm3.753 8.256a.75.75 0 1 0 0 1.5h.45a.75.75 0 0 0 0-1.5h-.45Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSmartphone216;
