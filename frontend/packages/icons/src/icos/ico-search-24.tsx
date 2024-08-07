import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSearch24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M10.19 4.661c-1.442.235-2.648.844-3.662 1.852a6.463 6.463 0 0 0-1.93 4.651c-.001.926.134 1.62.483 2.484.856 2.12 2.75 3.629 5.048 4.019.455.077 1.524.086 1.971.017 1.014-.158 2.054-.572 2.831-1.127l.329-.235 1.5 1.497c.825.823 1.551 1.516 1.613 1.539a.985.985 0 0 0 .598-.013.803.803 0 0 0 .386-.398c.055-.144.055-.43.001-.574-.023-.062-.716-.788-1.539-1.613l-1.497-1.5.235-.329c.556-.777.971-1.821 1.126-2.831.066-.425.066-1.436.001-1.86-.429-2.799-2.434-4.914-5.232-5.523-.512-.111-1.736-.141-2.262-.056m1.496 1.461c2.212.225 3.985 1.83 4.461 4.039.102.473.102 1.524 0 1.999-.408 1.908-1.78 3.384-3.623 3.898a5.16 5.16 0 0 1-3.092-.118c-1.633-.589-2.875-2.025-3.235-3.743-.111-.528-.122-1.4-.025-1.938.283-1.572 1.308-2.923 2.768-3.65a4.913 4.913 0 0 1 2.746-.487"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSearch24;
