import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoServer16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]}>
        <path
          d="M14.167 8V3.833a.667.667 0 0 0-.667-.666h-11a.667.667 0 0 0-.667.666V8m12.334 0H1.834m12.333 0v4.167a.667.667 0 0 1-.667.666h-11a.667.667 0 0 1-.667-.666V8"
          strokeWidth={1.5}
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M4.333 6.083a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm0 4.834a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"
          fill={theme.color[color]}
          strokeWidth={0.333}
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
export default IcoServer16;
