import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoEmojiHappy40 = ({
  'aria-label': ariaLabel,
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
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.874 4.84a9.034 9.034 0 0 0-9.034 9.034v12.242a9.034 9.034 0 0 0 9.034 9.033h12.242a9.034 9.034 0 0 0 9.033-9.033V13.874a9.034 9.034 0 0 0-9.033-9.034H13.874ZM7.84 13.874a6.034 6.034 0 0 1 6.034-6.034h12.242a6.034 6.034 0 0 1 6.033 6.034v12.242a6.034 6.034 0 0 1-6.033 6.033H13.874a6.034 6.034 0 0 1-6.034-6.033V13.874Zm3.48 6.192a1.5 1.5 0 0 1 2.008.664l.01.017a6.363 6.363 0 0 0 .337.535c.26.371.659.87 1.208 1.37 1.087.988 2.743 1.964 5.112 1.964 2.368 0 4.024-.976 5.112-1.964a8.31 8.31 0 0 0 1.207-1.37 6.373 6.373 0 0 0 .337-.535l.01-.017H13.328h13.333a1.5 1.5 0 0 1 2.68 1.348l-1.342-.67c1.342.67 1.341.67 1.341.671v.002l-.002.003-.004.008-.01.02a5.211 5.211 0 0 1-.143.256c-.093.16-.23.378-.41.635-.358.513-.9 1.19-1.646 1.868-1.502 1.366-3.848 2.745-7.13 2.745s-5.628-1.38-7.13-2.745a11.322 11.322 0 0 1-1.648-1.868 9.419 9.419 0 0 1-.519-.83 5.211 5.211 0 0 1-.032-.06l-.01-.021-.004-.008-.002-.003v-.002l1.34-.672-1.341.671a1.5 1.5 0 0 1 .67-2.012Zm4.908-6.03a2.192 2.192 0 0 0-.731 4.259 2.152 2.152 0 0 0 2.798-2.798 2.193 2.193 0 0 0-2.067-1.46Zm5.342 2.192a2.192 2.192 0 0 1 4.258-.731 2.152 2.152 0 0 1-2.798 2.798 2.193 2.193 0 0 1-1.46-2.067Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmojiHappy40;
