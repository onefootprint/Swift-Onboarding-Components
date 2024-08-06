import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdFront24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <circle cx={7.833} cy={7.833} fill={theme.color[color]} r={0.833} />
      <circle cx={10.333} cy={7.833} fill={theme.color[color]} r={0.833} />
      <path
        d="M7 9.917s.52.97 2.083.97c1.563 0 2.084-.97 2.084-.97"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <rect x={14.143} y={14.143} width={2.857} height={1.25} rx={0.625} fill={theme.color[color]} />
      <rect x={12.238} y={16.048} width={4.762} height={1.25} rx={0.625} fill={theme.color[color]} />
      <rect x={4.5} y={4.5} width={15} height={15} rx={1.667} stroke={theme.color[color]} strokeWidth={1.5} />
    </svg>
  );
};
export default IcoIdFront24;
