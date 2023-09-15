import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoReturn24 = ({
  'aria-label': ariaLabel,
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
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        d="M9.75 8.784a.75.75 0 0 0 .662-1.346L9.75 8.784Zm-2.313 4.56a.75.75 0 0 0-1.5 0h1.5Zm5.437-7.814a.75.75 0 1 0-1.06-1.06l1.06 1.06ZM9.515 7.828l-.53-.53a.75.75 0 0 0 0 1.06l.53-.53Zm2.298 3.359a.75.75 0 0 0 1.06-1.06l-1.06 1.06ZM10.081 8.11c.331-.673.332-.672.332-.672h.001a.152.152 0 0 1 .005.003l.007.003a1.017 1.017 0 0 1 .04.023c.01.008.06.041.114.107.05.062.181.256.131.534a.634.634 0 0 1-.282.432c-.067.04-.033-.003.326-.042.32-.036.82-.062 1.588-.062v-1.5c-.793 0-1.356.027-1.754.07-.358.04-.694.104-.937.25a.87.87 0 0 0-.417.588.834.834 0 0 0 .175.67.994.994 0 0 0 .33.265c.003 0 .004.001.005.002h.002l.001.001.333-.672Zm2.263.326c.97 0 1.918.288 2.725.827l.834-1.247a6.407 6.407 0 0 0-3.56-1.08v1.5Zm2.725.827a4.906 4.906 0 0 1 1.807 2.202l1.386-.574a6.406 6.406 0 0 0-2.36-2.875l-.833 1.247Zm1.807 2.202c.372.896.47 1.883.28 2.835l1.47.292a6.407 6.407 0 0 0-.364-3.701l-1.386.574Zm.28 2.835a4.907 4.907 0 0 1-1.343 2.512l1.06 1.06a6.407 6.407 0 0 0 1.754-3.28l-1.471-.292Zm-1.343 2.512a4.906 4.906 0 0 1-2.512 1.343l.292 1.47a6.407 6.407 0 0 0 3.28-1.752l-1.06-1.061ZM13.3 18.156a4.907 4.907 0 0 1-2.835-.28l-.574 1.386a6.407 6.407 0 0 0 3.701.365l-.292-1.471Zm-2.835-.28a4.907 4.907 0 0 1-2.202-1.807l-1.247.834a6.406 6.406 0 0 0 2.875 2.36l.574-1.387ZM8.264 16.07a4.907 4.907 0 0 1-.827-2.726h-1.5c0 1.268.376 2.506 1.08 3.56l1.247-.834Zm3.55-11.6-2.83 2.829 1.062 1.06 2.828-2.828-1.06-1.06Zm-2.83 3.89 2.83 2.828 1.06-1.06-2.829-2.83-1.06 1.062Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoReturn24;
