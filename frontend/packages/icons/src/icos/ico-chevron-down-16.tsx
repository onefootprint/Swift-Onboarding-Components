import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronDown16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M4.103 5.664a.657.657 0 0 0-.423.583c0 .244-.049.189 1.864 2.107.992.995 1.851 1.836 1.91 1.871.275.162.639.188.959.069.153-.058.24-.14 1.994-1.89 1.663-1.66 1.837-1.842 1.876-1.96.168-.506-.357-.981-.843-.762-.092.041-.509.442-1.78 1.712L8 9.053 6.34 7.394c-1.271-1.27-1.688-1.671-1.78-1.712a.638.638 0 0 0-.457-.018"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronDown16;
