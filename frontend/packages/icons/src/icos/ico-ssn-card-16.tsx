import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSsnCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M4.667 6.667h2.666M4.667 9H6m4-2.333h1.333v2H10v-2Zm-7.333 6h10.666A.667.667 0 0 0 14 12V4a.667.667 0 0 0-.667-.667H2.667A.667.667 0 0 0 2 4v8c0 .368.298.667.667.667Z"
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
export default IcoSsnCard16;
