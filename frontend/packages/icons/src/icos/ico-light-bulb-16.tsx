import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLightBulb16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M5.832 11.833V11.4a.727.727 0 0 0-.359-.61 4.826 4.826 0 0 1-2.307-4.122 4.834 4.834 0 1 1 7.36 4.121.727.727 0 0 0-.36.611v.433m-4.334 0v.833a2.167 2.167 0 0 0 4.335 0v-.833m-4.335 0h4.335"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLightBulb16;
