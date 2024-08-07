import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M7.84 12v6.68h3.874l.015-1.37c.015-1.36.016-1.372.122-1.69.151-.453.362-.792.711-1.144.242-.244.376-.341.68-.491.569-.281.732-.303 2.208-.304l1.27-.001v-.98c0-.539-.01-.98-.022-.98-.011 0-.092.036-.178.08-.398.203-.955.249-1.457.121-.427-.109-.675-.252-1.007-.58a2.183 2.183 0 0 1-.594-2.097c.14-.596.621-1.189 1.178-1.455.607-.289 1.347-.301 1.88-.029.086.044.167.08.178.08.012 0 .022-.567.022-1.26V5.32H7.84V12" />
    </svg>
  );
};
export default IcoFootprint24;
