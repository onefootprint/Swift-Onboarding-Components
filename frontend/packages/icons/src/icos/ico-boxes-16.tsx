import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBoxes16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 3.567c0-.374 0-.56.073-.703a.667.667 0 0 1 .291-.291c.143-.073.33-.073.703-.073h3.266v4.333H2.5V3.567ZM9.166 2.5h3.267c.374 0 .56 0 .703.073a.667.667 0 0 1 .291.291c.073.143.073.33.073.703v3.266H9.166V2.5ZM2.5 9.167h4.333V13.5H3.567c-.374 0-.56 0-.703-.073a.667.667 0 0 1-.291-.291c-.073-.143-.073-.33-.073-.703V9.167ZM9.166 9.167H13.5v3.266c0 .374 0 .56-.073.703a.667.667 0 0 1-.291.291c-.143.073-.33.073-.703.073H9.166V9.167Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoBoxes16;
