import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.201 1.576c-.288.056-.666.341-.825.62-.175.308-.163-.12-.163 5.79 0 5.892-.01 5.517.16 5.813.094.163.343.409.507.502.287.162-.035.152 5.12.152 5.183 0 4.832.011 5.133-.161.162-.092.409-.341.501-.505.163-.288.153.101.153-5.787 0-5.926.012-5.496-.163-5.804a1.656 1.656 0 0 0-.562-.526 1.375 1.375 0 0 0-.286-.096c-.179-.034-9.402-.032-9.575.002M5.2 8v5.2H3.467V2.8H5.2V8m7.333 0v5.2h-6.08V2.8h6.08V8M8.382 4.56c-.491.101-.676.686-.327 1.035.196.196.184.195 1.496.186l1.164-.008.115-.08c.338-.238.39-.677.113-.954-.196-.196-.165-.192-1.37-.197-.594-.002-1.13.006-1.191.018m0 2.667c-.491.101-.676.686-.327 1.035.196.196.184.194 1.496.186l1.164-.008.115-.081c.338-.237.39-.677.113-.954-.196-.196-.165-.191-1.37-.196-.594-.003-1.13.005-1.191.018"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBook16;
