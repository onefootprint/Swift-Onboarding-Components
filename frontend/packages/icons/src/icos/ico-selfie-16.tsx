import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSelfie16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M5.5 13.5H3.167a.667.667 0 0 1-.667-.667V10.5m8 3h2.333a.667.667 0 0 0 .667-.667V10.5m-11-5V3.167c0-.369.298-.667.667-.667H5.5m5 0h2.333c.368 0 .667.298.667.667V5.5"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.167 9.5v-3c0-.368.298-.667.666-.667h.39c.178 0 .347-.07.472-.195l.276-.276a.667.667 0 0 1 .472-.195h1.114c.177 0 .346.07.471.195l.277.276a.667.667 0 0 0 .471.195h.39c.369 0 .667.299.667.667v3a.667.667 0 0 1-.667.667H5.833a.667.667 0 0 1-.667-.667Z"
        stroke={theme.color[color]}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7.9v-.01m.5.01a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
        stroke={theme.color[color]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSelfie16;
