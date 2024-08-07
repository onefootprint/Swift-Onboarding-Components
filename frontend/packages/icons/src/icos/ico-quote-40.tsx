import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoQuote40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path d="M12.378 7.07a10.081 10.081 0 0 0-4.361 1.567c-2.283 1.484-3.776 3.655-4.433 6.445-.145.616-.145.647-.167 9.268L3.396 33h14.471l-.017-7.217-.017-7.216-3.983-.018-3.983-.017.001-.583c.004-2.356.462-3.814 1.538-4.9.707-.714 1.165-.924 2.111-.968l.683-.032V7l-.683.009c-.376.005-.888.032-1.139.061m18.755.003c-4.3.48-7.883 3.76-8.763 8.022-.208 1.008-.235 2.117-.236 9.988L22.133 33H36.6V18.533h-7.933v-.916c.001-2.72.886-4.556 2.566-5.326.325-.148.519-.186 1.082-.211l.685-.031V7l-.683.009c-.376.004-.909.033-1.184.064" />
    </svg>
  );
};
export default IcoQuote40;
