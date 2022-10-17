import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const LogoFpDefault = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={116}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M28 2.86h9.062v2.186h-6.555v4.338h6.02v2.186h-6.02v6.289h-2.508M46.852 12.46c0-2.079-1.307-3.536-3.214-3.536-1.929 0-3.214 1.457-3.214 3.536 0 2.078 1.285 3.535 3.214 3.535 1.907 0 3.214-1.457 3.214-3.535Zm-8.785 0c0-3.236 2.314-5.572 5.57-5.572 3.236 0 5.572 2.336 5.572 5.572 0 3.235-2.336 5.57-5.571 5.57-3.257 0-5.572-2.335-5.57-5.57ZM59.262 12.46c0-2.079-1.307-3.535-3.214-3.535-1.929 0-3.214 1.456-3.214 3.535 0 2.078 1.285 3.535 3.214 3.535 1.907 0 3.214-1.457 3.214-3.535Zm-8.785 0c0-3.236 2.314-5.571 5.57-5.571 3.236 0 5.571 2.336 5.571 5.571s-2.335 5.57-5.57 5.57c-3.258 0-5.572-2.335-5.571-5.57ZM79.99 12.46c0-2.142-1.243-3.535-3.128-3.535s-3.129 1.393-3.129 3.535c0 2.122 1.244 3.536 3.129 3.536s3.128-1.414 3.128-3.535Zm-8.443-5.4h2.336v1.372c.6-.878 1.864-1.543 3.365-1.543 3.192 0 5.078 2.314 5.078 5.572-.002 3.256-1.972 5.57-5.207 5.57-1.308 0-2.572-.557-3.236-1.414v5.142h-2.336M92.718 7.061h2.336l-.002 10.799h-2.334V7.061Zm-.344-3.3c0-.856.643-1.52 1.5-1.52.879 0 1.544.664 1.544 1.52 0 .836-.665 1.5-1.544 1.5-.857 0-1.5-.664-1.5-1.5ZM97.863 7.061h2.336v1.8c.727-1.157 1.97-1.971 3.556-1.971 2.292 0 3.9 1.521 3.9 3.857v7.114h-2.336l.001-6.578c0-1.35-.836-2.293-2.207-2.293-1.822 0-2.914 1.542-2.914 4.135l-.002 4.736h-2.334M90.941 7.035a3.804 3.804 0 0 0-1.066-.145c-1.306 0-2.72.943-3.299 2.228V7.061H84.24V17.86h2.336v-4.028c0-3.342 1.393-4.757 2.979-4.757.49 0 1 .085 1.386.255M69.283 15.678c-.407.193-.96.275-1.368.275-.878 0-1.478-.558-1.478-1.629v-5.27h2.838V7.06h-2.838V3.846h-2.335V7.06h-1.886v1.993h1.886v5.4c0 2.464 1.521 3.578 3.556 3.578.543 0 1.145-.092 1.625-.232M115.932 15.68c-.406.192-.961.274-1.368.274-.878 0-1.479-.557-1.479-1.629l.002-5.27h2.836V7.062h-2.836V3.847h-2.336V7.06h-1.886v1.993h1.886v5.4c0 2.464 1.521 3.578 3.556 3.578a6.09 6.09 0 0 0 1.625-.232M12 15h4v-3.54c-.589.342-1.27.54-2 .54a4 4 0 1 1 0-8c.73 0 1.411.199 2 .54V0H0v24h7v-4a5 5 0 0 1 5-5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default LogoFpDefault;
