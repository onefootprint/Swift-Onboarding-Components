import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoForbid40 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M12.843 11.075a11.394 11.394 0 0 1 7.159-2.515c6.32 0 11.442 5.123 11.442 11.442 0 2.71-.942 5.199-2.515 7.159L12.843 11.075Zm-1.768 1.768a11.394 11.394 0 0 0-2.515 7.159c0 6.32 5.123 11.442 11.442 11.442 2.71 0 5.199-.942 7.159-2.515L11.075 12.843Zm8.927-6.783c-7.7 0-13.942 6.242-13.942 13.942s6.242 13.942 13.942 13.942 13.942-6.242 13.942-13.942S27.702 6.06 20.002 6.06Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoForbid40;
