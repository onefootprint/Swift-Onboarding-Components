import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoVoter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <g clipPath="url(#prefix__b)">
          <path
            d="M4.667 6.667h.666M2.667 3.333h10.666c.368 0 .667.299.667.667v8a.667.667 0 0 1-.667.667H2.667A.667.667 0 0 1 2 12V4c0-.368.298-.667.667-.667Z"
            stroke={theme.color[color]}
            strokeWidth={1.333}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
        <clipPath id="prefix__b">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoVoter16;
