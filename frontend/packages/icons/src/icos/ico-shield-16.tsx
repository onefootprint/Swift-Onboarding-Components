import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShield16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m6.167 7.667 1.166 1.166 2.5-2.5M13.5 7.942V4.147a.667.667 0 0 0-.456-.632L8.211 1.904a.667.667 0 0 0-.422 0l-4.833 1.61a.667.667 0 0 0-.456.633v3.795c0 3.315 2.833 4.891 5.5 6.33 2.667-1.439 5.5-3.015 5.5-6.33Z"
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
export default IcoShield16;
