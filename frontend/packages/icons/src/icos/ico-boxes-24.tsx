import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBoxes24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.333 6.667c0-.467 0-.7.091-.879a.833.833 0 0 1 .364-.364c.179-.09.412-.09.879-.09h3.667v5h-5V6.666ZM13.666 5.333h3.667c.467 0 .7 0 .879.091.156.08.284.208.364.364.09.179.09.412.09.879v3.666h-5v-5ZM5.333 13.667h5v5H6.668c-.467 0-.7 0-.878-.091a.833.833 0 0 1-.365-.364c-.09-.179-.09-.412-.09-.879v-3.666ZM13.666 13.667h5v3.666c0 .467 0 .7-.09.879a.833.833 0 0 1-.364.364c-.179.09-.412.09-.879.09h-3.666v-5Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoBoxes24;
