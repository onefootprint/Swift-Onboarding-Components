import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsVertical24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M11.473 3.773a1.45 1.45 0 0 0-.685.558c-.42.632-.277 1.464.334 1.947.38.3.939.38 1.411.202.278-.105.648-.447.778-.72a1.484 1.484 0 0 0-.703-1.953c-.329-.153-.816-.168-1.135-.034m.127 6.822c-.37.121-.757.447-.91.765a1.56 1.56 0 0 0 .002 1.28c.113.231.437.555.668.668.378.184.902.184 1.28 0 .236-.115.555-.438.68-.688.088-.175.1-.252.1-.62s-.012-.445-.1-.62a1.714 1.714 0 0 0-.685-.684c-.18-.092-.274-.113-.575-.122-.198-.006-.405.003-.46.021m-.109 6.915c-.415.171-.758.534-.875.924a1.455 1.455 0 0 0 .898 1.808c.318.119.775.099 1.094-.05a1.481 1.481 0 0 0 .702-1.952c-.113-.237-.44-.559-.69-.682-.265-.13-.868-.155-1.129-.048" />
    </svg>
  );
};
export default IcoDotsVertical24;
