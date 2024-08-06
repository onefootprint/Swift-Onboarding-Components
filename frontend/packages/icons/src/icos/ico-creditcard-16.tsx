import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCreditcard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 4.337c0-.538.437-.974.974-.974h9.051c.538 0 .974.436.974.974V5.84H2.5V4.337Zm0 2.804v4.522c0 .538.437.974.974.974h9.051a.974.974 0 0 0 .974-.974V7.141H2.5Zm.974-5.278A2.474 2.474 0 0 0 1 4.337v7.326a2.474 2.474 0 0 0 2.474 2.474h9.051A2.474 2.474 0 0 0 15 11.663V4.337a2.474 2.474 0 0 0-2.474-2.474h-9.05Zm.212 8.076a.65.65 0 0 1 .65-.65h2.155a.65.65 0 1 1 0 1.3H4.336a.65.65 0 0 1-.65-.65Zm7.546-.65a.65.65 0 0 0 0 1.3h.43a.65.65 0 0 0 0-1.3h-.43Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCreditcard16;
