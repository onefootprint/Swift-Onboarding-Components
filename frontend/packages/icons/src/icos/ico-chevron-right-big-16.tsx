import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRightBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.213 2.104a.688.688 0 0 0-.318.328.7.7 0 0 0 .014.501c.041.093.61.677 2.525 2.594L9.906 8l-2.472 2.473c-1.915 1.917-2.484 2.501-2.525 2.594-.19.42.106.877.567.879a.724.724 0 0 0 .253-.043c.13-.059 5.061-4.977 5.206-5.192.284-.423.284-1-.001-1.422-.063-.093-1.097-1.147-2.593-2.641C6.412 2.72 5.826 2.15 5.733 2.108a.698.698 0 0 0-.52-.004"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRightBig16;
