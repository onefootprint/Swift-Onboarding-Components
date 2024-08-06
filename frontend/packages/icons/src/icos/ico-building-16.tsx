import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBuilding16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M3.167 13.5V3.167c0-.369.298-.667.667-.667h8.333c.368 0 .667.298.667.667V13.5m-9.667 0h9.667m-9.667 0H1.834m11 0h1.333M5.833 5.167h1m2.334 0h1M5.834 7.833h1m2.333 0h1M5.834 10.5h1m2.333 0h1"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
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
export default IcoBuilding16;
