import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFileText16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8.5 2.167V5.5c0 .368.298.667.666.667H12.5M5.833 8.833h2.333M5.833 11.5h4.333M3.833 1.833h4.39c.177 0 .347.07.472.196l3.943 3.942a.667.667 0 0 1 .195.472V13.5a.667.667 0 0 1-.667.667H3.833a.667.667 0 0 1-.667-.667v-11c0-.368.299-.667.667-.667Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
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
export default IcoFileText16;
