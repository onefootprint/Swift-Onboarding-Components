import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoDotsHorizontal16 = ({
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
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.95 7.995a1.475 1.475 0 1 1-2.95 0 1.475 1.475 0 0 1 2.95 0Zm5.775 0a1.475 1.475 0 1 1-2.95 0 1.475 1.475 0 0 1 2.95 0Zm4.3 1.475a1.475 1.475 0 1 0 0-2.95 1.475 1.475 0 0 0 0 2.95Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDotsHorizontal16;
