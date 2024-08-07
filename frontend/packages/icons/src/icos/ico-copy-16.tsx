import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCopy16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.013 1.226a1.02 1.02 0 0 0-.704.516 1.22 1.22 0 0 0-.083.262c-.018.097-.025 1.495-.02 4.091.007 3.679.01 3.953.054 4.061.102.256.33.483.585.584.103.041.281.047 1.734.054l1.619.008.008 1.619c.009 1.799.001 1.716.194 1.978.103.141.316.297.48.352.158.053 8.082.053 8.24 0 .26-.088.515-.332.62-.595.044-.108.047-.382.054-4.061.005-2.596-.002-3.994-.02-4.091a.954.954 0 0 0-.555-.706l-.179-.085-1.62-.008-1.62-.008V3.669c0-.922-.011-1.585-.027-1.671a.953.953 0 0 0-.554-.7l-.179-.085-3.947-.003c-2.17-.002-4.006.005-4.08.016m7.534 2.599v1.372l-1.794.008-1.793.008-.179.085a.953.953 0 0 0-.554.7c-.016.087-.027.805-.027 1.846v1.703H2.453V2.453h7.094v1.372m4 6.175v3.547H6.453V6.453h7.094V10"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCopy16;
