import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path d="M8.304 6.22c-1.934.932-3.566 1.731-3.628 1.777-.185.137-.199.279-.092.969.379 2.435 1.039 4.634 1.919 6.389.888 1.773 2 3.012 3.28 3.656 1.062.535 2.45.658 3.617.322 1.601-.461 3.033-1.85 4.094-3.97.884-1.768 1.543-3.959 1.922-6.397.112-.723.097-.837-.128-.991-.082-.056-1.72-.856-3.642-1.778-2.939-1.41-3.521-1.677-3.66-1.674-.133.003-.863.339-3.682 1.697m6.336 2.894v.674l-.23-.078c-.552-.188-1.216.106-1.464.646-.119.259-.119.75.001 1.01.252.55.901.835 1.463.644l.23-.078v1.062l-.791.013-.791.013-.266.131c-.331.163-.63.479-.758.799-.081.206-.093.312-.106 1l-.014.77H9.8V8.44h4.84v.674" />
    </svg>
  );
};
export default IcoFootprintShield24;
