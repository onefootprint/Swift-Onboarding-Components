import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoCheckCircle40 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 6.667c-7.364 0-13.333 5.97-13.333 13.333 0 7.364 5.97 13.333 13.333 13.333 7.364 0 13.333-5.97 13.333-13.333 0-7.364-5.97-13.333-13.333-13.333ZM9.167 20c0-5.983 4.85-10.833 10.833-10.833 5.983 0 10.833 4.85 10.833 10.833 0 5.983-4.85 10.833-10.833 10.833-5.983 0-10.833-4.85-10.833-10.833Zm15.667-3.128a1.25 1.25 0 1 0-2.168-1.244l-3.823 6.662a.417.417 0 0 1-.738-.03l-.723-1.54a1.25 1.25 0 1 0-2.264 1.061l.723 1.54c1.003 2.137 3.996 2.26 5.17.213l3.823-6.662Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoCheckCircle40;
