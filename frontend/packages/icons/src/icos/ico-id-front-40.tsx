import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdFront40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <ellipse cx={13.454} cy={13.455} rx={1.455} ry={1.454} fill={theme.color[color]} />
      <ellipse cx={18.545} cy={13.455} rx={1.455} ry={1.454} fill={theme.color[color]} />
      <path
        d="M12 18.789s1 1.94 4 1.94 4-1.94 4-1.94"
        stroke={theme.color[color]}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <rect x={24.286} y={24.286} width={5.714} height={1.905} rx={0.952} fill={theme.color[color]} />
      <rect x={20.476} y={28.095} width={9.524} height={1.905} rx={0.952} fill={theme.color[color]} />
      <rect x={5} y={5} width={30} height={30} rx={5} stroke={theme.color[color]} strokeWidth={3} />
    </svg>
  );
};
export default IcoIdFront40;
