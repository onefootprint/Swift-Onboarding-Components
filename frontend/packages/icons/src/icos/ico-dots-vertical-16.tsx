import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsVertical16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={1.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3.333A.667.667 0 1 0 8 2a.667.667 0 0 0 0 1.333ZM8 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334ZM8 14a.667.667 0 1 0 0-1.333A.667.667 0 0 0 8 14Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoDotsVertical16;
