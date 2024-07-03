import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDrivewealth24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.271 4.833a1.284 1.284 0 0 1 1.65-.752c.648.25 1.024.96.774 1.63l-4.93 13.244c-.064.44-.377.815-.837.982a1.739 1.739 0 0 1-.46.063 1.59 1.59 0 0 1-.438-.063c-.083-.042-.188-.083-.25-.125-.021-.02-.042-.02-.063-.042 0 0-.021 0-.021-.02a1.146 1.146 0 0 1-.376-.46l-.021-.063c0-.02-.02-.042-.02-.063l-2.947-7.98-2.026 5.515a1.275 1.275 0 0 1-.836 1.003 2.029 2.029 0 0 1-.48.063c-.063 0-.126 0-.188-.021-.084-.021-.167-.021-.23-.042-.084-.042-.188-.084-.25-.125-.022 0-.022-.021-.042-.021-.021 0-.021-.021-.042-.021a1.146 1.146 0 0 1-.376-.46l-.021-.063v-.02c0-.021-.021-.021-.021-.042L3.313 10.18c-.25-.648.084-1.379.773-1.63.648-.25 1.4.084 1.65.753l1.275 3.468 2.11-5.704c.188-.48.647-.814 1.149-.835a1.276 1.276 0 0 1 1.295.835l2.946 7.98 3.76-10.215Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDrivewealth24;
