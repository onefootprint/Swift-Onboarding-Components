import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLayer0116 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.198 8 2.205 9.49a.674.674 0 0 0 0 1.204l5.5 2.736a.663.663 0 0 0 .59 0l5.5-2.736a.674.674 0 0 0 0-1.205L10.803 8M5.197 8 2.205 6.51a.674.674 0 0 1 0-1.204l5.5-2.736a.663.663 0 0 1 .59 0l5.5 2.736a.674.674 0 0 1 0 1.205L10.803 8M5.197 8l2.507 1.247a.663.663 0 0 0 .59 0L10.804 8"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="square"
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
export default IcoLayer0116;
