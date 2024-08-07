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
        d="M5.08 6.106a.57.57 0 0 0-.268.225c-.073.097-.079.121-.079.334 0 .223.003.234.098.362.054.073.661.693 1.347 1.378C7.622 9.845 7.564 9.8 8 9.8c.436 0 .378.045 1.822-1.395.686-.685 1.293-1.305 1.347-1.378.095-.128.098-.139.098-.362 0-.213-.006-.237-.079-.334a.57.57 0 0 0-.268-.225.67.67 0 0 0-.52.003c-.09.04-.406.339-1.26 1.192L8 8.439 6.86 7.301c-.854-.853-1.17-1.152-1.26-1.192a.67.67 0 0 0-.52-.003"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronDown16;
