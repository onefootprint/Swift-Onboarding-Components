import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClock40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <rect width={40} height={40} rx={2.5} fill="#fff" />
        <path
          d="M20 13.333V20l4.167 4.167M35 20c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={2.5} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoClock40;
