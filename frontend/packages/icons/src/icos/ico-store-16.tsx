import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStore16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M14.167 5.168 12.31 2.76a.666.666 0 0 0-.528-.26H4.217a.667.667 0 0 0-.528.26L1.833 5.168m12.334 0v.667c0 .592-.265 1.125-.685 1.491m.685-2.158H1.833m0 0v.667c0 .592.265 1.125.686 1.491m10.963 0a2.08 2.08 0 0 1-1.37.51c-1.136 0-2.056-.896-2.056-2.001m3.426 1.491v5.507a.667.667 0 0 1-.667.667h-9.63a.667.667 0 0 1-.666-.667V7.326m0 0c.363.317.844.51 1.37.51 1.135 0 2.056-.896 2.056-2.001m4.11 0v-.667m0 .667c0 1.105-.92 2-2.055 2-1.135 0-2.055-.895-2.055-2m0 0v-.667M9.37 13.5v-2c0-.738-.613-1.335-1.37-1.335-.757 0-1.37.598-1.37 1.334V13.5"
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
export default IcoStore16;
