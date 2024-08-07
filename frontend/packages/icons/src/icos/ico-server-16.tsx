import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoServer16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.297 2.562c-.359.047-.756.329-.935.665-.168.316-.161.104-.161 4.773 0 4.62-.005 4.449.147 4.749.098.193.354.453.546.556.319.17-.026.161 6.106.161s5.787.009 6.106-.161a1.58 1.58 0 0 0 .546-.556c.152-.3.147-.129.147-4.749 0-4.669.007-4.457-.161-4.773a1.504 1.504 0 0 0-.591-.561 1.384 1.384 0 0 0-.368-.105c-.245-.032-11.136-.031-11.382.001m11.236 3.025v1.786H2.467l-.007-1.76a63.649 63.649 0 0 1 .006-1.793c.01-.027 1.132-.032 5.54-.027l5.527.007v1.787M4.04 4.988a.636.636 0 0 0-.353.459.653.653 0 0 0 .646.792c.659 0 .908-.841.359-1.212-.103-.07-.146-.081-.332-.088-.178-.007-.231.001-.32.049m9.5 5.432-.007 1.78H2.467l-.007-1.78-.007-1.78h11.094l-.007 1.78m-9.474-.61a.669.669 0 0 0-.118 1.148.67.67 0 0 0 .941-.179.659.659 0 0 0-.556-1.018.7.7 0 0 0-.267.049"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoServer16;
