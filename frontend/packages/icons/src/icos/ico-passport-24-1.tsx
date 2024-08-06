import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport241 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.475 4.545c0-.45.366-.817.817-.817h10.214a2.763 2.763 0 0 1 2.763 2.763v10.214a2.763 2.763 0 0 1-2.763 2.763H6.292a.817.817 0 0 1-.817-.817V4.545Zm1.634.818v12.47h9.397c.623 0 1.129-.504 1.129-1.128V6.491c0-.623-.506-1.128-1.129-1.128H7.11Zm5.263 3.066a1.384 1.384 0 1 0 0 2.767 1.384 1.384 0 0 0 0-2.767ZM9.738 9.812a2.634 2.634 0 1 1 5.268 0 2.634 2.634 0 0 1-5.268 0Zm.625 4.063a.625.625 0 1 0 0 1.25h4.018a.625.625 0 0 0 0-1.25h-4.018Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassport241;
