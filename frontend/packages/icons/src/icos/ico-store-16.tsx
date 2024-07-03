import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStore16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.65 2.496A2.45 2.45 0 0 1 3.88 1.06h8.247c.96 0 1.833.562 2.23 1.436l.47 1.035c.035.076.066.153.092.231.08.114.128.254.128.404 0 .068-.002.135-.006.203.004.059.006.118.006.176v7.934a2.45 2.45 0 0 1-2.45 2.45H3.41a2.45 2.45 0 0 1-2.45-2.45V4.545c0-.057.002-.115.006-.172a3.393 3.393 0 0 1-.006-.207c0-.15.048-.29.13-.405a2.45 2.45 0 0 1 .09-.23l.47-1.035Zm11.985 1.89a1.654 1.654 0 0 1-.327.845c-.199.25-.492.423-.93.423-.88 0-1.487-.74-1.487-1.488a.7.7 0 1 0-1.4 0c0 .749-.607 1.488-1.487 1.488-.88 0-1.488-.74-1.488-1.488a.7.7 0 1 0-1.4 0c0 .749-.607 1.488-1.487 1.488-.438 0-.73-.174-.93-.423a1.652 1.652 0 0 1-.327-.844 1.05 1.05 0 0 1 .082-.276l.47-1.036a1.05 1.05 0 0 1 .957-.615h8.246c.412 0 .785.24.956.615l.47 1.036c.04.087.068.18.082.275Zm-3.444 1.658a2.82 2.82 0 0 0 2.188 1.01c.48 0 .907-.114 1.269-.312v5.737c0 .58-.47 1.05-1.05 1.05h-1.926v-2.364a2.45 2.45 0 0 0-2.45-2.45h-.437a2.45 2.45 0 0 0-2.45 2.45v2.364H3.41c-.58 0-1.05-.47-1.05-1.05V6.742c.362.198.788.312 1.269.312a2.82 2.82 0 0 0 2.187-1.01 2.82 2.82 0 0 0 2.188 1.01 2.82 2.82 0 0 0 2.187-1.01Zm-3.456 5.122c0-.58.47-1.05 1.05-1.05h.437c.58 0 1.05.47 1.05 1.05v2.362H6.735v-2.363Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoStore16;
