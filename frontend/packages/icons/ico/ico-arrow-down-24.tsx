import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoArrowDown24 = ({
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.754 5.66a.75.75 0 0 0-1.5 0v10.816l-3.301-3.459a.75.75 0 0 0-1.086 1.036l4.594 4.812a.75.75 0 0 0 1.085 0l4.594-4.812a.75.75 0 0 0-1.085-1.036l-3.301 3.459V5.66Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoArrowDown24;
