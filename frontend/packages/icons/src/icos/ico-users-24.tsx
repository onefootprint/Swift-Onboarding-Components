import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUsers24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.02 12.984c2.802-1.164 6.332.504 7.045 5.002.076.477-.31.889-.793.889h-4.314m-5-11.042a2.708 2.708 0 1 1-5.417 0 2.708 2.708 0 0 1 5.417 0Zm7.5 0a2.708 2.708 0 1 1-5.417 0 2.708 2.708 0 0 1 5.417 0Zm-5.805 11.042H3.727c-.483 0-.869-.414-.793-.891 1.135-7.145 9.377-7.145 10.512 0 .076.477-.31.891-.793.891Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUsers24;
