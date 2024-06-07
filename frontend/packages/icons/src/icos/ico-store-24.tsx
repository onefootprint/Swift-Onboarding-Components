import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoStore24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
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
        d="M4.785 5.732A2.75 2.75 0 0 1 7.288 4.12h9.424a2.75 2.75 0 0 1 2.504 1.612l.538 1.183c.04.087.074.176.104.266.09.124.142.275.142.439 0 .077-.002.155-.007.233.005.066.007.133.007.2v9.067a2.75 2.75 0 0 1-2.75 2.75H6.75A2.75 2.75 0 0 1 4 17.12V8.053c0-.066.003-.131.007-.197A3.825 3.825 0 0 1 4 7.62c0-.164.053-.316.143-.44.03-.09.064-.178.104-.265l.538-1.183ZM18.487 7.87a1.94 1.94 0 0 1-.386.998c-.236.296-.585.502-1.101.502-1.037 0-1.75-.87-1.75-1.75a.75.75 0 0 0-1.5 0c0 .88-.713 1.75-1.75 1.75s-1.75-.87-1.75-1.75a.75.75 0 1 0-1.5 0c0 .88-.713 1.75-1.75 1.75-.516 0-.865-.206-1.101-.502a1.94 1.94 0 0 1-.385-.996 1.25 1.25 0 0 1 .098-.336l.538-1.183a1.25 1.25 0 0 1 1.138-.733h9.424c.49 0 .936.287 1.138.733l.538 1.183c.049.106.082.219.099.334ZM14.5 9.688A3.176 3.176 0 0 0 17 10.87c.575 0 1.078-.144 1.5-.392v6.642c0 .69-.56 1.25-1.25 1.25H15v-2.75a2.75 2.75 0 0 0-2.75-2.75h-.5A2.75 2.75 0 0 0 9 15.62v2.75H6.75c-.69 0-1.25-.56-1.25-1.25v-6.642c.422.248.926.392 1.5.392 1.065 0 1.93-.484 2.5-1.182A3.176 3.176 0 0 0 12 10.87c1.065 0 1.93-.484 2.5-1.182Zm-4 5.931c0-.69.56-1.25 1.25-1.25h.5c.69 0 1.25.56 1.25 1.25v2.75h-3v-2.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoStore24;
