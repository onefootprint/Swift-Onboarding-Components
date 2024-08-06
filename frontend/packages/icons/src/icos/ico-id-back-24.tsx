import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdBack24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <rect
        x={4.5}
        y={4.5}
        width={15}
        height={15}
        rx={1.667}
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <rect x={7.556} y={7} width={8.889} height={1.25} rx={0.625} fill={theme.color[color]} />
      <rect x={10.223} y={9.222} width={6.222} height={1.25} rx={0.625} fill={theme.color[color]} />
      <path
        d="M7.556 15.095c0-.42.442-.762.987-.762h6.914c.545 0 .988.341.988.762v1.143c0 .42-.443.762-.988.762H8.543c-.545 0-.987-.341-.987-.762v-1.143Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdBack24;
