import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmojiHappy16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M4.474 0A4.474 4.474 0 0 0 0 4.474v6.132a4.474 4.474 0 0 0 4.474 4.473h6.132a4.473 4.473 0 0 0 4.473-4.473V4.474A4.474 4.474 0 0 0 10.606 0H4.474ZM1.4 4.474A3.074 3.074 0 0 1 4.474 1.4h6.132a3.074 3.074 0 0 1 3.073 3.074v6.132a3.073 3.073 0 0 1-3.073 3.073H4.474A3.074 3.074 0 0 1 1.4 10.606V4.474Zm1.795 3.102a.75.75 0 0 1 1.004.332l.005.01.03.051a4.166 4.166 0 0 0 .745.902 3.71 3.71 0 0 0 2.56.985 3.71 3.71 0 0 0 2.562-.985 4.173 4.173 0 0 0 .745-.902l.03-.052.004-.009H4.2h6.68a.75.75 0 0 1 1.34.675l-.652-.326.652.326-.002.003-.002.003-.005.01-.016.031a4.718 4.718 0 0 1-.26.416c-.18.256-.451.596-.825.935a5.208 5.208 0 0 1-3.57 1.375A5.208 5.208 0 0 1 3.97 9.98a5.667 5.667 0 0 1-1.03-1.253 3.27 3.27 0 0 1-.072-.128l-.005-.01-.002-.004-.001-.002.67-.337-.67.336a.75.75 0 0 1 .335-1.007Zm2.458-1.895a.028.028 0 1 0 0-.056.028.028 0 0 0 0 .056Zm-.972-.028a.972.972 0 1 1 1.944 0 .972.972 0 0 1-1.944 0Zm4.774 0a.028.028 0 1 1-.057 0 .028.028 0 0 1 .057 0Zm-.029-.972a.972.972 0 1 0 0 1.944.972.972 0 0 0 0-1.944Z"
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
export default IcoEmojiHappy16;
