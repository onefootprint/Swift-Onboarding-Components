import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const LogoFpCompact = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={97}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M23.333 2.384h7.552v1.82h-5.463V7.82h5.017v1.822h-5.017v5.24h-2.09M39.043 10.383c0-1.732-1.089-2.946-2.678-2.946-1.607 0-2.679 1.214-2.679 2.946 0 1.732 1.072 2.946 2.679 2.946 1.589 0 2.678-1.214 2.678-2.946Zm-7.32 0c0-2.696 1.928-4.643 4.642-4.643 2.696 0 4.642 1.947 4.642 4.643 0 2.696-1.946 4.642-4.642 4.642-2.715 0-4.643-1.946-4.642-4.642ZM49.385 10.383c0-1.732-1.09-2.946-2.679-2.946-1.607 0-2.678 1.214-2.678 2.946 0 1.732 1.071 2.947 2.678 2.947 1.59 0 2.679-1.215 2.679-2.947Zm-7.32 0c0-2.696 1.928-4.642 4.641-4.642 2.697 0 4.643 1.946 4.643 4.642 0 2.697-1.946 4.643-4.643 4.643-2.714 0-4.642-1.947-4.642-4.643ZM66.659 10.384c0-1.786-1.036-2.946-2.607-2.946-1.571 0-2.608 1.16-2.608 2.945 0 1.768 1.037 2.947 2.608 2.947 1.57 0 2.607-1.179 2.607-2.946Zm-7.037-4.5h1.947v1.143c.5-.732 1.554-1.286 2.804-1.286 2.66 0 4.232 1.929 4.232 4.643-.001 2.714-1.643 4.642-4.34 4.642-1.089 0-2.142-.464-2.696-1.179v4.286h-1.947M77.265 5.884h1.947l-.002 9h-1.945v-9Zm-.287-2.75c0-.713.536-1.267 1.25-1.267.733 0 1.287.554 1.287 1.268 0 .696-.555 1.25-1.286 1.25a1.23 1.23 0 0 1-1.25-1.25ZM81.552 5.884H83.5v1.5c.606-.964 1.642-1.642 2.964-1.642 1.91 0 3.25 1.268 3.25 3.214v5.928h-1.947V9.402c0-1.125-.696-1.91-1.839-1.91-1.518 0-2.428 1.285-2.428 3.446l-.001 3.946h-1.946M75.784 5.863a3.17 3.17 0 0 0-.888-.121c-1.088 0-2.267.785-2.75 1.857V5.884H70.2v9h1.947v-3.357c0-2.785 1.16-3.964 2.482-3.964.408 0 .834.07 1.155.212M57.736 13.065c-.34.16-.8.23-1.14.23-.732 0-1.232-.466-1.232-1.358V7.545h2.365V5.884h-2.365V3.205H53.42v2.677h-1.572v1.661h1.572v4.5c0 2.053 1.267 2.982 2.963 2.982.452 0 .954-.077 1.354-.194M96.61 13.066c-.339.16-.8.23-1.14.23-.732 0-1.232-.465-1.232-1.358l.001-4.392h2.364V5.885h-2.364V3.206h-1.946v2.677H90.72v1.661h1.572v4.5c0 2.053 1.267 2.982 2.963 2.982a5.08 5.08 0 0 0 1.354-.194M10 12.5h3.334V9.55c-.491.285-1.06.45-1.667.45a3.333 3.333 0 1 1 1.667-6.217V0H0v20h5.834v-3.334c0-2.3 1.865-4.166 4.166-4.166Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default LogoFpCompact;
