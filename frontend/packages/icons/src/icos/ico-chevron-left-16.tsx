import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeft16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.613 3.704a.885.885 0 0 0-.16.063c-.105.057-3.616 3.579-3.687 3.7-.153.261-.176.633-.06.946.058.153.14.24 1.89 1.994 1.66 1.663 1.842 1.837 1.96 1.876.506.168.981-.357.762-.843-.041-.092-.442-.509-1.712-1.78L6.947 8l1.659-1.66c1.27-1.271 1.671-1.688 1.712-1.78a.615.615 0 0 0-.505-.863.71.71 0 0 0-.2.007"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeft16;
