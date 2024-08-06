import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      >
        <path d="M2.5 3.167c0-.369.298-.667.667-.667h9.666c.368 0 .667.298.667.667v8h-11v-8ZM1.167 11.167h13.666v1.666a.667.667 0 0 1-.667.667H1.833a.667.667 0 0 1-.666-.667v-1.666Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoLaptop16;
