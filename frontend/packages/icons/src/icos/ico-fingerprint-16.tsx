import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoFingerprint16 = ({
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
        d="M14.25 14.25V8c0-2.234-1.213-4.345-3.015-5.388m-9.474 7.759v3.879M1.76 8.216C1.545 4.12 4.675 1.75 8.005 1.75M8.005 5.198c1.546 0 2.8 1.078 2.8 3.018M10.805 10.37v1.294M5.206 11.233v1.293c0 1.078-.861 1.724-.861 1.724M7.79 8.647v3.017c0 1.508.689 2.586 2.584 2.586M5.521 6.707A2.792 2.792 0 0 0 5.206 8v1.078"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFingerprint16;
