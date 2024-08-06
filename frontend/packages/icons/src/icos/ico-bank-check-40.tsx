import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBankCheck40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <path
          d="M8.334 13.333H10m20 13.334h1.667M3.333 30V10c0-.92.747-1.667 1.667-1.667h30c.92 0 1.667.747 1.667 1.667v20c0 .92-.746 1.667-1.667 1.667H5c-.92 0-1.667-.747-1.667-1.667Zm20-10a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={6} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoBankCheck40;
