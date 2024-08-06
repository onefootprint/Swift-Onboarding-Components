import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdGeneric40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)">
        <rect x={5} y={5} width={30} height={30} rx={3.75} stroke={theme.color[color]} strokeWidth={3.333} />
        <path
          d="M11.111 11.524c0-.842.885-1.524 1.976-1.524h13.827c1.09 0 1.975.682 1.975 1.524v2.286c0 .841-.884 1.523-1.975 1.523H13.087c-1.091 0-1.976-.682-1.976-1.524v-2.285Z"
          fill={theme.color[color]}
        />
        <rect x={11.111} y={23.056} width={17.778} height={2.5} rx={1.25} fill={theme.color[color]} />
        <rect x={16.444} y={27.5} width={12.444} height={2.5} rx={1.25} fill={theme.color[color]} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={6} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoIdGeneric40;
