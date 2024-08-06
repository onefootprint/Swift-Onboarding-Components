import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCloseSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m8.666 8.667 6.667 6.666m0-6.666-6.667 6.666"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoCloseSmall24;
