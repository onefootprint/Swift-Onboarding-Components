import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoFingerprint24 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
        d="M19.75 19.75V12c0-2.77-1.503-5.387-3.738-6.681m-11.749 9.62v4.811M4.263 12.267C3.996 7.19 7.877 4.25 12.007 4.25M12.007 8.526c1.917 0 3.47 1.336 3.47 3.741M15.478 14.94v1.603M8.535 16.009v1.603c0 1.336-1.068 2.138-1.068 2.138M11.74 12.802v3.741c0 1.87.854 3.207 3.204 3.207M8.926 10.397A3.462 3.462 0 0 0 8.536 12v1.336"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFingerprint24;
