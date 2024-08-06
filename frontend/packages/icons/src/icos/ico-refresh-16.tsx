import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoRefresh16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8.667 14a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333ZM14 7.333a.667.667 0 1 0-1.333 0 .667.667 0 0 0 1.333 0ZM13.286 9.512a.667.667 0 1 1-.667 1.155.667.667 0 0 1 .667-1.155ZM11.578 12.863a.667.667 0 1 0-.666-1.155.667.667 0 0 0 .666 1.155ZM12.618 5.333a.667.667 0 1 1-.667-1.154.667.667 0 0 1 .667 1.154Z"
          fill={theme.color[color]}
        />
        <path
          d="M6.167 9.833V13.5H2.5m3.5-.375a5.502 5.502 0 1 1 4.166-10.182"
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
export default IcoRefresh16;
