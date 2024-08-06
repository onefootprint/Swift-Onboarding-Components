import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSettings16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeWidth={1.5} strokeLinejoin="round">
        <path d="m5.701 3.58-1.195-.276a.667.667 0 0 0-.621.178l-.403.403a.667.667 0 0 0-.178.62l.276 1.196c.062.27-.05.55-.28.705l-1.17.78a.667.667 0 0 0-.296.554v.52c0 .223.11.43.296.555l1.17.78c.23.153.342.434.28.704l-.276 1.195a.667.667 0 0 0 .178.622l.403.402c.162.162.397.23.621.178l1.195-.276c.27-.062.551.05.705.28l.78 1.17a.667.667 0 0 0 .554.297h.52a.667.667 0 0 0 .555-.297l.78-1.17a.667.667 0 0 1 .704-.28l1.195.276a.667.667 0 0 0 .622-.178l.402-.402a.666.666 0 0 0 .178-.622L12.42 10.3a.667.667 0 0 1 .28-.705l1.17-.78a.667.667 0 0 0 .297-.554v-.52a.667.667 0 0 0-.297-.555l-1.17-.78a.667.667 0 0 1-.28-.704l.276-1.195a.666.666 0 0 0-.178-.621l-.402-.403a.667.667 0 0 0-.622-.178L10.3 3.58a.667.667 0 0 1-.704-.28l-.78-1.17a.667.667 0 0 0-.555-.297h-.52a.667.667 0 0 0-.554.297l-.78 1.17a.667.667 0 0 1-.705.28Z" />
        <path d="M9.833 8a1.833 1.833 0 1 1-3.666 0 1.833 1.833 0 0 1 3.666 0Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSettings16;
