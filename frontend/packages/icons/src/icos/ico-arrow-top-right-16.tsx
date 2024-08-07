import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowTopRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.107 3.424A.673.673 0 0 0 6.721 4c0 .144.094.357.202.459.184.172.127.167 1.916.176l1.625.007-2.468 2.473C6.638 8.474 5.499 9.629 5.464 9.68c-.055.08-.064.125-.064.32 0 .208.006.236.078.335.128.178.26.256.457.272.34.027.15.194 2.924-2.575l2.499-2.495.007 1.625c.009 1.788.004 1.731.176 1.915a.746.746 0 0 0 .459.202.674.674 0 0 0 .579-.386c.045-.099.048-.259.056-2.453.005-1.642-.002-2.399-.022-2.52a.591.591 0 0 0-.36-.481c-.103-.049-.194-.051-2.586-.051-1.986.001-2.496.008-2.56.036"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowTopRight16;
