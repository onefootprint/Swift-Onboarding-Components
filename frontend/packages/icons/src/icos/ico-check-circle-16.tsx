import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheckCircle16 = ({
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
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 .5a7.6 7.6 0 1 0 0 15.199A7.6 7.6 0 0 0 8 .5ZM1.8 8.1a6.2 6.2 0 1 1 12.399 0A6.2 6.2 0 0 1 1.8 8.1Zm8.948-1.794a.7.7 0 0 0-1.215-.696L7.351 9.414a.252.252 0 0 1-.446-.019l-.413-.88a.7.7 0 0 0-1.268.595l.413.88c.568 1.21 2.263 1.28 2.928.12l2.183-3.804Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoCheckCircle16;
