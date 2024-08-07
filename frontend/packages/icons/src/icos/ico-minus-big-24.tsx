import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinusBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.174 11.278c-.738.178-.779 1.19-.058 1.436.195.066 13.573.066 13.768 0 .617-.211.708-1.035.15-1.354l-.174-.1-6.78-.006c-3.729-.004-6.837.007-6.906.024"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMinusBig24;
