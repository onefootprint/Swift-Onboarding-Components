import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWarning40 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.873 10.316c-.768-1.533-2.956-1.533-3.725 0L9.377 27.81c-.695 1.385.312 3.017 1.862 3.017h17.535c1.55 0 2.557-1.631 1.863-3.017l-8.764-17.495Zm-5.96-1.12c1.692-3.374 6.506-3.373 8.196 0l8.763 17.496c1.527 3.047-.689 6.636-4.098 6.636H11.24c-3.41 0-5.625-3.59-4.097-6.638l8.771-17.495Zm4.093 5.799c.92 0 1.666.746 1.666 1.666v3.333a1.667 1.667 0 0 1-3.333 0v-3.333c0-.92.746-1.667 1.667-1.667Zm0 10a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWarning40;
