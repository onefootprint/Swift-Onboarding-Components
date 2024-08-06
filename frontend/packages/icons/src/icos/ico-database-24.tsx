import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDatabase24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M17.833 6.583c0 1.15-2.611 2.084-5.833 2.084s-5.833-.933-5.833-2.084m11.666 0c0-1.15-2.611-2.083-5.833-2.083s-5.833.933-5.833 2.083m11.666 0v10.834c0 1.15-2.611 2.083-5.833 2.083s-5.833-.933-5.833-2.083V6.583m11.666 3.542c0 1.15-2.611 2.083-5.833 2.083s-5.833-.932-5.833-2.083m11.666 3.542c0 1.15-2.611 2.083-5.833 2.083s-5.833-.933-5.833-2.083"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDatabase24;
