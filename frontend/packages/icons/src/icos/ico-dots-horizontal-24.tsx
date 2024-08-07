import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsHorizontal24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M6.936 10.936a1.156 1.156 0 0 0-.686.963c-.088 1.113 1.247 1.706 2.024.898.553-.576.364-1.515-.374-1.862a1.227 1.227 0 0 0-.964.001m4.659-.043a1.151 1.151 0 0 0-.762 1.105A1.14 1.14 0 0 0 12 13.167c.589 0 1.046-.38 1.151-.959a1.32 1.32 0 0 0-.111-.769c-.085-.165-.332-.402-.528-.504-.174-.091-.719-.116-.917-.042m4.501.043c-.73.34-.921 1.287-.375 1.856.485.504 1.225.512 1.707.018.559-.574.375-1.53-.361-1.873a1.231 1.231 0 0 0-.971-.001M7.46 12.04c-.019.031-.042.034-.069.007a.074.074 0 0 1-.011-.087c.019-.031.042-.034.069-.007a.074.074 0 0 1 .011.087m4.602-.077c.041.067-.051.144-.107.088-.046-.046-.017-.131.045-.131.019 0 .047.02.062.043m4.558.077c-.019.031-.042.034-.069.007a.074.074 0 0 1-.011-.087c.019-.031.042-.034.069-.007a.074.074 0 0 1 .011.087"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDotsHorizontal24;
