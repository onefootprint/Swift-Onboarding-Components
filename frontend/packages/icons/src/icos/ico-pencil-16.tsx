import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPencil16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.927 1.385c-.084.027-.21.086-.28.131-.07.045-2.175 2.132-4.677 4.636-4.263 4.267-4.556 4.566-4.632 4.728-.135.288-.141.389-.133 1.987.008 1.371.012 1.472.058 1.56.07.13.172.235.297.302.105.057.129.058 1.573.066 1.598.008 1.699.002 1.987-.133.162-.076.461-.369 4.728-4.632 2.504-2.502 4.589-4.605 4.633-4.672a1.16 1.16 0 0 0 .192-.691c0-.283-.054-.477-.192-.692-.113-.175-2.361-2.407-2.508-2.489a1.43 1.43 0 0 0-.265-.11 1.69 1.69 0 0 0-.781.009m1.453 2.208c.568.568 1.033 1.052 1.033 1.074 0 .022-.354.394-.786.826l-.787.787-1.06-1.06-1.06-1.06.8-.8c.44-.44.806-.8.813-.8.007 0 .478.465 1.047 1.033M9.893 6.12l1.053 1.053L7.76 10.36l-3.187 3.187h-2.12v-2.12l3.18-3.18a508.209 508.209 0 0 1 3.194-3.18c.007 0 .487.474 1.066 1.053"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPencil16;
