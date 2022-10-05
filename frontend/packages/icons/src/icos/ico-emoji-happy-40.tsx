import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoEmojiHappy40 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.31 6.06a8.25 8.25 0 0 0-8.25 8.25v11.375a8.25 8.25 0 0 0 8.25 8.25h11.375a8.25 8.25 0 0 0 8.25-8.25V14.31a8.25 8.25 0 0 0-8.25-8.25H14.31Zm-5.75 8.25a5.75 5.75 0 0 1 5.75-5.75h11.375a5.75 5.75 0 0 1 5.75 5.75v11.375a5.75 5.75 0 0 1-5.75 5.75H14.31a5.75 5.75 0 0 1-5.75-5.75V14.31Zm5.115 6.436a1.25 1.25 0 0 0-2.233 1.123l1.118-.559c-1.118.559-1.118.56-1.117.56v.001l.002.003.003.007.01.018c.006.014.016.032.028.054a8.621 8.621 0 0 0 .474.757c.328.47.825 1.09 1.51 1.712 1.375 1.251 3.522 2.513 6.527 2.513 3.006 0 5.153-1.262 6.529-2.513a10.364 10.364 0 0 0 1.51-1.712 8.621 8.621 0 0 0 .473-.757l.015-.028.014-.026.01-.018.003-.007v-.003h.002c0-.001 0-.002-1.118-.561l1.118.559a1.25 1.25 0 0 0-2.234-1.122l-.01.018a6.117 6.117 0 0 1-.322.512c-.245.35-.623.823-1.143 1.296-1.03.936-2.602 1.862-4.847 1.862-2.244 0-3.816-.926-4.846-1.862a7.872 7.872 0 0 1-1.143-1.296 6.168 6.168 0 0 1-.322-.512l-.01-.019Zm2.822-6.373a2.125 2.125 0 1 0 0 4.25 2.125 2.125 0 0 0 0-4.25Zm4.875 2.124a2.125 2.125 0 1 1 4.25 0 2.125 2.125 0 0 1-4.25 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoEmojiHappy40;
