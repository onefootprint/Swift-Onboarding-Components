import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarningSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8 6.75v1.5m0 1.312v-.004m-.36-5.215-3.543 6.05a.417.417 0 0 0 .36.628h7.087c.322 0 .522-.35.36-.627L8.36 4.343a.417.417 0 0 0-.72 0Zm.464 5.22a.104.104 0 1 1-.208 0 .104.104 0 0 1 .208 0Z"
          stroke={theme.color[color]}
          strokeLinecap="round"
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
export default IcoWarningSmall16;
