import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoScroll16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      data-colored={false}
    >
      <path
        d="M6.06 5.198h3.018M6.06 7.784h3.018m3.771-6.034c-.774 0-1.185.868-1.185 1.94v.215m1.185-2.155c.774 0 1.401.868 1.401 1.94v.215h-2.586m1.185-2.155H5.2c-.953 0-1.725.772-1.725 1.724v8.62m8.19-8.189v8.405c0 1.072-.843 1.94-1.617 1.94m-6.573-2.155h5.173v.215c0 1.072.627 1.94 1.4 1.94m-6.573-2.155H1.75v.43c0 .953.772 1.725 1.724 1.725h6.573"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoScroll16;
