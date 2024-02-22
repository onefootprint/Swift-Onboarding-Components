import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLeaf16 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m14.338 1.65.698.048a.7.7 0 0 0-.824-.737l.126.689ZM3.095 13.48c1.296 1.038 3.037 1.557 4.899 1.557 1.679 0 2.945-.985 3.867-2.275.92-1.284 1.569-2.96 2.029-4.577.463-1.627.748-3.247.918-4.455a36.728 36.728 0 0 0 .225-1.99l.002-.03v-.011l-.697-.049-.127-.689-.003.001-.008.002-.029.005a18.482 18.482 0 0 0-.523.105c-.353.075-.857.186-1.46.335a40.55 40.55 0 0 0-4.44 1.358c-1.612.605-3.271 1.383-4.54 2.35C1.954 6.073.95 7.317.95 8.869c0 1.419.422 2.633 1.155 3.598a26.455 26.455 0 0 0-.91 1.285c-.045.067-.08.12-.102.157l-.027.043-.008.012-.002.003v.001c-.001 0-.001.001.594.37l-.595-.369a.7.7 0 0 0 1.19.737l.001-.002.005-.008.022-.035.092-.14a20.197 20.197 0 0 1 .73-1.04Zm.865-1.1c.998.803 2.413 1.257 4.034 1.257 1.055 0 1.95-.6 2.729-1.69.783-1.093 1.378-2.59 1.82-4.145.44-1.544.714-3.097.88-4.267.053-.382.095-.723.127-1.007-.289.064-.636.144-1.027.24-1.173.29-2.731.726-4.283 1.31-1.56.585-3.073 1.306-4.183 2.152C2.932 7.087 2.35 7.97 2.35 8.87c0 .966.243 1.785.666 2.457 1.197-1.417 2.9-3.127 4.869-4.17a.7.7 0 0 1 .655 1.238c-1.742.922-3.314 2.483-4.468 3.852l-.112.134Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoLeaf16;
