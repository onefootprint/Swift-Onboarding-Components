import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M5.333 6.167c0-.46.374-.834.834-.834h11.666c.46 0 .834.373.834.834V14.5c0 .46-.373.833-.834.833H6.168a.833.833 0 0 1-.833-.833V6.167Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M3.667 15.333h16.666v2.5c0 .46-.373.834-.833.834h-15a.833.833 0 0 1-.833-.834v-2.5Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLaptop24;
