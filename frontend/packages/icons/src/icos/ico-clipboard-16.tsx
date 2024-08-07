import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClipboard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.627 1.229a1.24 1.24 0 0 0-.716.381c-.2.21-.311.432-.355.717l-.032.206-.669.001c-.791.001-1.004.024-1.235.132-.215.101-.48.352-.592.561-.169.318-.16.039-.16 5.44 0 5.346-.007 5.113.147 5.416.097.192.353.453.546.555.317.169.039.161 5.439.161s5.122.008 5.439-.161a1.56 1.56 0 0 0 .546-.555c.154-.303.147-.07.147-5.416 0-5.401.009-5.122-.16-5.44a1.514 1.514 0 0 0-.592-.561c-.231-.108-.444-.131-1.235-.132l-.669-.001-.031-.206a1.302 1.302 0 0 0-1.1-1.1c-.243-.031-4.472-.03-4.718.002M10.2 3.333V4.2H5.8l-.007-.84c-.004-.462-.001-.855.006-.873.01-.027.457-.033 2.207-.027l2.194.007v.866m-5.666.687c.001.474.123.794.41 1.069.193.185.382.287.626.339.26.056 4.6.056 4.86 0 .244-.052.433-.154.626-.339.287-.276.409-.595.41-1.069l.001-.234.7.007.7.007v9.733H3.133l-.007-4.84a498.26 498.26 0 0 1 .006-4.873c.01-.025.176-.033.707-.033h.694l.001.233"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClipboard16;
