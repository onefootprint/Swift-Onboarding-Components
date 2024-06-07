import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSsnCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M.1 3.693C.1 2.758.858 2 1.793 2h12.414c.935 0 1.693.758 1.693 1.693v8.442c0 .935-.758 1.693-1.693 1.693H1.793A1.693 1.693 0 0 1 .1 12.135V3.693ZM1.793 3.4a.293.293 0 0 0-.293.293v8.442c0 .162.131.293.293.293h12.414a.293.293 0 0 0 .293-.293V3.693a.293.293 0 0 0-.293-.293H1.793Z"
        fill={theme.color[color]}
      />
      <rect x={2.5} y={8.25} width={2} height={1.5} rx={0.75} fill={theme.color[color]} />
      <rect x={5.5} y={8.25} width={2} height={1.5} rx={0.75} fill={theme.color[color]} />
      <rect x={8.5} y={8.25} width={2} height={1.5} rx={0.75} fill={theme.color[color]} />
      <rect x={11.5} y={8.25} width={2} height={1.5} rx={0.75} fill={theme.color[color]} />
    </svg>
  );
};
export default IcoSsnCard16;
