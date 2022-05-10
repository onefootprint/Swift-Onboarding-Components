import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoArrowRightSmall24 = ({
  color = 'primary',
  style,
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
      style={style}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.26 8.2a.75.75 0 1 0-1.02 1.1l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.499-3.249a.748.748 0 0 0 0-1.102L14.26 8.2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoArrowRightSmall24;
