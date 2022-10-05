import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShield16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.285.391a.7.7 0 0 0-.573 0L.742 3.516a.7.7 0 0 0-.412.592l.698.047a75.86 75.86 0 0 0-.699-.046v.011l-.002.027a13.494 13.494 0 0 0-.015.461c-.005.31-.003.748.024 1.273.055 1.046.21 2.456.62 3.877.41 1.415 1.086 2.89 2.214 4.019 1.146 1.146 2.721 1.895 4.829 1.895 2.107 0 3.683-.75 4.829-1.896 1.128-1.127 1.804-2.603 2.213-4.018.41-1.421.566-2.83.62-3.877a19.002 19.002 0 0 0 .014-1.635 7.316 7.316 0 0 0-.005-.099l-.001-.027V4.11l-.7.046.7-.047a.7.7 0 0 0-.413-.592L8.286.391Zm-6.573 4.24v-.016L8 1.797l6.286 2.818v.016c.005.282.003.689-.022 1.178-.05.982-.196 2.277-.567 3.56-.372 1.288-.958 2.517-1.858 3.418-.882.881-2.1 1.485-3.84 1.485-1.738 0-2.956-.604-3.838-1.485-.9-.9-1.486-2.13-1.859-3.418-.37-1.283-.516-2.578-.566-3.56a17.58 17.58 0 0 1-.023-1.178Zm9.018 1.616a.7.7 0 1 0-1.135-.82L6.998 9.024l-.625-.75a.7.7 0 1 0-1.075.897L6.5 10.612a.7.7 0 0 0 1.105-.038l3.125-4.327Z"
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

export default IcoShield16;
