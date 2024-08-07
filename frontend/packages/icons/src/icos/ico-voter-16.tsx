import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoVoter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.307 2.757c-.415.132-.75.46-.874.853l-.06.19v8.4l.061.192c.118.376.465.723.84.841l.193.06h11.066l.193-.06c.375-.118.722-.465.84-.841l.061-.192V3.8l-.06-.19a1.319 1.319 0 0 0-.715-.789l-.185-.088-5.627-.005c-4.493-.004-5.648.002-5.733.029m11.046 5.25-.006 4.033H2.653l-.006-4.033-.007-4.034h10.72l-.007 4.034m-8.94-1.901a.573.573 0 0 0-.267.225c-.074.097-.079.121-.079.334 0 .21.006.237.078.337.182.252.401.32.972.299.38-.014.515-.056.663-.208.127-.131.177-.284.16-.493-.019-.235-.126-.385-.353-.494-.093-.045-.168-.051-.587-.051-.419 0-.494.006-.587.051"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoVoter16;
