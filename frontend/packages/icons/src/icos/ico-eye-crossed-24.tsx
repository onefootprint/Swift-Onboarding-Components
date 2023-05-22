import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoEyeCrossed24 = ({
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
        d="M19.78 4.22a.75.75 0 0 1 0 1.06l-5.655 5.655a4036169100.43 4036169100.43 0 0 1-.008.008l-3.174 3.175-.004.003c0 .002-.002.003-.003.004L5.28 19.78a.75.75 0 0 1-1.06-1.06l2.086-2.086a9.13 9.13 0 0 1-1.729-2.57C4.202 13.234 4 12.452 4 12c0-.39.15-1.01.412-1.674a9.303 9.303 0 0 1 1.31-2.288C6.958 6.458 8.974 5 12 5c1.882 0 3.384.565 4.553 1.387L18.72 4.22a.75.75 0 0 1 1.06 0Zm-9.23 8.168L12 10.94l.388-.388a1.5 1.5 0 0 0-1.838 1.838Zm2.974-2.973a3.001 3.001 0 0 0-4.109 4.109l-2.049 2.049a7.636 7.636 0 0 1-1.422-2.125C5.604 12.693 5.5 12.14 5.5 12c0-.11.07-.522.307-1.123a7.805 7.805 0 0 1 1.096-1.915C7.917 7.667 9.526 6.5 12 6.5c1.44 0 2.576.394 3.472.967l-1.948 1.948Zm4.77-.089a.75.75 0 0 1 1.004.344c.239.488.41.946.524 1.335.109.372.178.727.178.995 0 .39-.15 1.01-.412 1.674a9.306 9.306 0 0 1-1.31 2.288C17.042 17.542 15.026 19 12 19a8.367 8.367 0 0 1-2.196-.282.75.75 0 1 1 .392-1.448c.538.145 1.137.23 1.804.23 2.474 0 4.083-1.167 5.097-2.462a7.806 7.806 0 0 0 1.096-1.915c.237-.601.307-1.013.307-1.123 0-.058-.024-.253-.118-.575a7.005 7.005 0 0 0-.43-1.095.75.75 0 0 1 .343-1.004Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEyeCrossed24;
