import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassportCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.667 3.667v8.666A.667.667 0 0 1 13 13H3a.667.667 0 0 1-.667-.667V3.667C2.333 3.298 2.632 3 3 3h10c.368 0 .667.298.667.667Z" />
        <path d="M6.333 10.667h3.334m0-3.667a1.667 1.667 0 1 1-3.334 0 1.667 1.667 0 0 1 3.334 0Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoPassportCard16;
