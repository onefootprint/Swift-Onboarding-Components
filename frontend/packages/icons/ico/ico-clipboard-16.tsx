import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoClipboard16 = ({
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
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.927 2.225c0-.124.1-.225.225-.225h3.7c.124 0 .225.1.225.225V3.613c0 .124-.1.225-.225.225h-3.7a.225.225 0 0 1-.225-.225V2.225Zm-1.4.225v-.225C4.527 1.328 5.254.6 6.152.6h3.7c.898 0 1.625.728 1.625 1.625v.225h.457A2.55 2.55 0 0 1 14.484 5v7.864a2.55 2.55 0 0 1-2.55 2.55H4.07a2.55 2.55 0 0 1-2.55-2.55V5a2.55 2.55 0 0 1 2.55-2.55h.457Zm6.933 1.4h.474c.635 0 1.15.515 1.15 1.15v7.864a1.15 1.15 0 0 1-1.15 1.15H4.07a1.15 1.15 0 0 1-1.15-1.15V5c0-.635.515-1.15 1.15-1.15h.474a1.625 1.625 0 0 0 1.608 1.388h3.7c.817 0 1.493-.603 1.608-1.388ZM5.22 8.238a.7.7 0 0 1 .7-.7h4.163a.7.7 0 1 1 0 1.4H5.92a.7.7 0 0 1-.7-.7Zm.7 2.076a.7.7 0 1 0 0 1.4h4.163a.7.7 0 1 0 0-1.4H5.92Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoClipboard16;
