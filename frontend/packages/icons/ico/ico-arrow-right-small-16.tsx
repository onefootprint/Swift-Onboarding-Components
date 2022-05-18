import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoArrowRightSmall16 = ({
  color = 'primary',
  style,
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
      style={style}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.26 4.2a.75.75 0 1 0-1.02 1.1l2.1 1.95H2.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 0 0 1.02 1.1l3.498-3.249a.748.748 0 0 0 0-1.102L10.26 4.2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoArrowRightSmall16;
