import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWand24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.022 4.361c.25-.25.656-.25.907 0l2.137 2.137c.25.25.25.657 0 .907l-13.68 13.68a.641.641 0 0 1-.906 0l-2.137-2.138a.641.641 0 0 1 0-.907L17.022 4.361Zm-2.487 4.3 1.23 1.231 2.941-2.94-1.23-1.23-2.941 2.94Zm.324 2.138-1.23-1.23-8.926 8.925 1.23 1.23L14.86 10.8Z"
        fill={theme.color[color]}
      />
      <path
        d="M9.93 4.205a.213.213 0 0 0 .096-.096l.632-1.263a.214.214 0 0 1 .383 0l.631 1.263c.021.042.055.075.096.096l1.264.632a.214.214 0 0 1 0 .382l-1.264.632a.214.214 0 0 0-.096.096l-.631 1.264a.214.214 0 0 1-.383 0l-.632-1.264a.213.213 0 0 0-.095-.096L8.667 5.22a.214.214 0 0 1 0-.382l1.264-.632ZM17.625 13.61a.213.213 0 0 0 .096-.096l.632-1.264a.214.214 0 0 1 .382 0l.632 1.264c.02.041.054.075.096.096l1.264.632a.214.214 0 0 1 0 .382l-1.264.632a.214.214 0 0 0-.096.095l-.632 1.264a.214.214 0 0 1-.382 0l-.632-1.264a.214.214 0 0 0-.096-.095l-1.263-.632a.214.214 0 0 1 0-.382l1.263-.632ZM5.656 8.48a.214.214 0 0 0 .096-.096l.631-1.264a.214.214 0 0 1 .383 0l.632 1.264c.02.042.054.075.095.096l1.264.632a.214.214 0 0 1 0 .382l-1.264.632a.214.214 0 0 0-.095.096l-.632 1.264a.214.214 0 0 1-.383 0l-.631-1.264a.214.214 0 0 0-.096-.096l-1.264-.632a.214.214 0 0 1 0-.382l1.264-.632Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWand24;
