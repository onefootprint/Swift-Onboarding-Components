import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarning16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8 6v2.4m0 2.1v-.007M7.425 2.15l-5.67 9.68a.667.667 0 0 0 .575 1.004h11.34c.515 0 .836-.559.576-1.003l-5.67-9.681a.667.667 0 0 0-1.151 0Zm.742 8.351a.167.167 0 1 1-.334 0 .167.167 0 0 1 .334 0Z"
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
export default IcoWarning16;
