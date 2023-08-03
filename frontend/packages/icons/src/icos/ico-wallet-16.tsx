import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoWallet16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={17}
      height={17}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.44 4.334c0-.434.35-.785.784-.785h7.425c.55 0 .997.446.997.997v.572H4.224a.785.785 0 0 1-.784-.784Zm10.606.212v.572h.996a.7.7 0 0 1 .7.7v7.637a2.397 2.397 0 0 1-2.396 2.397h-8.91a2.397 2.397 0 0 1-2.396-2.397v-8.91c0-.025.001-.05.004-.076a2.185 2.185 0 0 1 2.18-2.32h7.425a2.397 2.397 0 0 1 2.397 2.397ZM3.44 6.373v7.082c0 .55.446.997.997.997h8.909c.55 0 .997-.447.997-.997V6.519H4.224a2.18 2.18 0 0 1-.784-.146Zm8.845 3.552a.076.076 0 1 0 0-.152.076.076 0 0 0 0 .152Zm-.924-.076a.924.924 0 1 1 1.848 0 .924.924 0 0 1-1.848 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWallet16;
