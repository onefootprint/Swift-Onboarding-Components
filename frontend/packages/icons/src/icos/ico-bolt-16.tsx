import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBolt16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.277.637a1.084 1.084 0 0 0-.429.238c-.131.127-5.836 8.398-5.921 8.584-.218.478.025 1.065.526 1.268.147.06.149.06 2.114.067l1.966.008v1.838c0 1.904.006 2.012.113 2.224.086.171.273.349.454.433.145.066.198.076.407.076.208 0 .26-.01.391-.074.083-.041.197-.119.254-.174.133-.13 5.832-8.392 5.924-8.589a.682.682 0 0 0 .07-.349 1.4 1.4 0 0 0-.033-.311c-.076-.251-.328-.513-.593-.615-.109-.042-.298-.047-2.087-.055l-1.966-.009-.001-1.845c0-1.44-.008-1.878-.036-1.996a.944.944 0 0 0-.882-.733 1.27 1.27 0 0 0-.271.014m.019 5.256c.087.188.29.39.477.478l.147.069 1.858.013 1.858.014-2.418 3.506L7.8 13.48l-.013-1.613-.014-1.614-.069-.146a1.101 1.101 0 0 0-.477-.478L7.08 9.56l-1.858-.013-1.858-.014 2.418-3.506L8.2 2.52l.013 1.613.014 1.614.069.146"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBolt16;
