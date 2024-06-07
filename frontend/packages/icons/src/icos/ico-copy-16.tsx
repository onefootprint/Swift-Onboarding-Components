import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCopy16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.4 3.438c0-.573.465-1.038 1.038-1.038h5.865a.82.82 0 0 1 .82.82.7.7 0 1 0 1.4 0A2.22 2.22 0 0 0 9.304 1H3.438A2.438 2.438 0 0 0 1 3.438v5.865a2.22 2.22 0 0 0 2.22 2.22.7.7 0 1 0 0-1.4.82.82 0 0 1-.82-.82V3.438Zm3.476 3.475c0-.573.464-1.037 1.037-1.037h5.648c.574 0 1.038.464 1.038 1.037v5.648c0 .574-.464 1.038-1.038 1.038H6.913a1.038 1.038 0 0 1-1.037-1.038V6.913Zm1.037-2.437a2.438 2.438 0 0 0-2.437 2.437v5.648A2.438 2.438 0 0 0 6.913 15h5.648A2.438 2.438 0 0 0 15 12.561V6.913a2.438 2.438 0 0 0-2.438-2.437H6.913Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCopy16;
