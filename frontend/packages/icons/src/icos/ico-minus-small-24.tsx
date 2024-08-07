import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinusSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.74 11.259a1.438 1.438 0 0 1-.147.037c-.254.056-.511.411-.511.704 0 .172.114.43.243.548.241.222.032.212 4.684.211 4.086-.001 4.299-.004 4.451-.075a.734.734 0 0 0 .398-.413c.146-.349-.007-.751-.358-.945-.109-.06-.502-.067-4.42-.073a368.653 368.653 0 0 0-4.34.006"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMinusSmall24;
