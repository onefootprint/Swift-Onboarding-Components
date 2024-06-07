import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.4 3.75a.35.35 0 0 1 .35-.35h12.5a.35.35 0 0 1 .35.35v8.5a.35.35 0 0 1-.35.35H8.56c-.233-.747-.582-1.534-1.022-2.167a3.964 3.964 0 0 0-.804-.874A2.399 2.399 0 0 0 5.5 5.1a2.4 2.4 0 0 0-1.234 4.459 3.964 3.964 0 0 0-.804.874c-.44.633-.789 1.42-1.022 2.167h-.69a.35.35 0 0 1-.35-.35v-8.5Zm5.07 7.425c.279.4.525.905.717 1.425H3.813c.191-.52.438-1.024.716-1.425.408-.587.755-.775.971-.775.216 0 .563.188.97.775ZM1.75 2.1A1.65 1.65 0 0 0 .1 3.75v8.5c0 .911.739 1.65 1.65 1.65h12.5a1.65 1.65 0 0 0 1.65-1.65v-8.5a1.65 1.65 0 0 0-1.65-1.65H1.75ZM4.4 7.5a1.1 1.1 0 1 1 2.2 0 1.1 1.1 0 0 1-2.2 0Zm6.35-1.4a.65.65 0 1 0 0 1.3h1.5a.65.65 0 1 0 0-1.3h-1.5Zm0 3a.65.65 0 1 0 0 1.3h1.5a.65.65 0 1 0 0-1.3h-1.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdCard16;
