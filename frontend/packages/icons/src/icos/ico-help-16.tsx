import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHelp16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M12.334 3.667 9.91 6.089M6.086 9.914l-2.42 2.42m0-8.667 2.42 2.419M9.911 9.91l2.423 2.422M14.167 8A6.167 6.167 0 1 1 1.833 8a6.167 6.167 0 0 1 12.334 0Zm-3.333 0a2.833 2.833 0 1 1-5.667 0 2.833 2.833 0 0 1 5.667 0Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
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
export default IcoHelp16;
