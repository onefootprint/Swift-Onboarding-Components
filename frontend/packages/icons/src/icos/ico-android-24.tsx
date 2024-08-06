import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoAndroid24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.008 5.345c-.035.006-.07.012-.1.033a.271.271 0 0 0-.067.375l.575.858c-.888.47-1.55 1.253-1.766 2.191h7.365c-.216-.938-.878-1.72-1.767-2.191l.575-.858a.271.271 0 0 0-.066-.375.273.273 0 0 0-.375.075l-.633.933a4.124 4.124 0 0 0-2.833 0l-.633-.933a.268.268 0 0 0-.275-.108Zm.858 2.124a.4.4 0 1 1 0 .8.4.4 0 0 1 0-.8Zm2.933 0a.4.4 0 1 1 0 .799.4.4 0 0 1 0-.799Zm-6 1.866a.8.8 0 0 0-.799.8v3.733a.8.8 0 0 0 .8.8c.094 0 .183-.02.266-.05V9.385a.782.782 0 0 0-.266-.05Zm.8 0v5.866c0 .44.36.8.8.8h5.866c.44 0 .8-.36.8-.8V9.335H8.6Zm8.265 0a.782.782 0 0 0-.266.05v5.233c.083.029.173.05.267.05a.8.8 0 0 0 .8-.8v-3.733a.8.8 0 0 0-.8-.8Zm-7.198 7.199V17.6a1.067 1.067 0 0 0 2.133 0v-1.066H9.666Zm3.2 0V17.6a1.067 1.067 0 0 0 2.132 0v-1.066h-2.133Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoAndroid24;
