import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMenu16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.715 3.228a.605.605 0 0 0-.442.332.63.63 0 0 0 .312.843c.104.047.332.049 6.415.049s6.311-.002 6.415-.049a.623.623 0 0 0-.002-1.142c-.101-.045-.395-.048-6.346-.052-3.432-.002-6.29.006-6.352.019m-.141 4.206a.63.63 0 0 0-.349.691.658.658 0 0 0 .335.434l.132.068h12.616l.132-.068a.658.658 0 0 0 .335-.434.63.63 0 0 0-.353-.693c-.091-.042-.499-.045-6.426-.045-5.93.001-6.335.004-6.422.047m.011 4.163c-.492.224-.499.881-.012 1.14.091.048.299.05 6.427.05h6.333l.107-.058a.625.625 0 0 0-.025-1.132c-.104-.047-.332-.049-6.415-.049s-6.311.002-6.415.049"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMenu16;
