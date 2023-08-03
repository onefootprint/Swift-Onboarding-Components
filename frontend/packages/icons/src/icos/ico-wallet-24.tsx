import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoWallet24 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 6.5a1 1 0 0 1 1-1h8.75c.69 0 1.25.56 1.25 1.25v.75h-10a1 1 0 0 1-1-1Zm12.5.25v.75h1.25a.75.75 0 0 1 .75.75v9A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75c0-.03.002-.06.005-.088A2.5 2.5 0 0 1 6.5 4h8.75A2.75 2.75 0 0 1 18 6.75ZM5.5 8.792v8.458c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V9h-12c-.356 0-.694-.074-1-.208ZM15 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWallet24;
