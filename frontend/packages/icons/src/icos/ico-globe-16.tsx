import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoGlobe16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.58 2.7c.253-.227.4-.25.421-.25.02 0 .168.023.42.25.238.215.508.561.763 1.046.437.831.802 2.02.896 3.505H5.922c.094-1.486.459-2.674.896-3.505.255-.485.525-.83.763-1.046ZM4.52 7.251c.096-1.703.512-3.116 1.059-4.156l.065-.121A5.557 5.557 0 0 0 2.5 7.251h2.02Zm-2.02 1.5h2.02c.096 1.703.512 3.116 1.059 4.156l.065.121A5.557 5.557 0 0 1 2.5 8.751Zm3.422 0H10.08c-.094 1.486-.459 2.674-.896 3.505-.255.485-.525.83-.763 1.046-.252.228-.4.25-.42.25-.02 0-.168-.022-.42-.25-.238-.215-.508-.561-.763-1.046-.437-.831-.802-2.019-.896-3.505Zm5.56 0c-.095 1.703-.512 3.116-1.058 4.156l-.066.121a5.557 5.557 0 0 0 3.144-4.277h-2.02Zm2.02-1.5a5.557 5.557 0 0 0-3.144-4.277l.066.12c.546 1.04.963 2.454 1.058 4.157h2.02Zm-5.504 7.701h.003A6.951 6.951 0 1 0 8.007 1.05a6.951 6.951 0 0 0-.009 13.902Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGlobe16;
