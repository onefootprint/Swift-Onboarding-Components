import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../src/types';

const IcoPencil16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.91 1.508c-.61-.61-1.599-.61-2.21 0L2.119 10.09a.7.7 0 0 0-.187.334l-.862 3.667a.7.7 0 0 0 .841.841l3.667-.862a.7.7 0 0 0 .334-.187l8.583-8.583c.61-.61.61-1.6 0-2.21l-1.583-1.583Zm-1.22.99a.163.163 0 0 1 .23 0l1.585 1.583a.163.163 0 0 1 0 .23l-1.086 1.086-1.814-1.814 1.086-1.085ZM9.616 4.573 3.248 10.94l-.558 2.372 2.372-.558 6.367-6.367-1.814-1.814Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoPencil16;
