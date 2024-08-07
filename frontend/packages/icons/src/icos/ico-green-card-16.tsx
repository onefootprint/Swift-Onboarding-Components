import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGreenCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.297 2.562c-.359.047-.756.329-.935.665-.168.316-.161.104-.161 4.773 0 4.62-.005 4.449.147 4.749.098.193.354.453.546.556.319.17-.026.161 6.106.161s5.787.009 6.106-.161a1.58 1.58 0 0 0 .546-.556c.152-.3.147-.129.147-4.749 0-4.669.007-4.457-.161-4.773a1.504 1.504 0 0 0-.591-.561 1.384 1.384 0 0 0-.368-.105c-.245-.032-11.136-.031-11.382.001M13.533 8v4.2H2.467L2.46 8.027c-.004-2.296-.001-4.189.006-4.207.01-.027 1.132-.032 5.54-.027l5.527.007V8M4.251 6.931a.622.622 0 0 0-.16 1.037c.159.139.303.165.909.165.606 0 .75-.026.909-.165a.622.622 0 0 0-.16-1.037c-.096-.044-.183-.05-.749-.05-.566 0-.653.006-.749.05m3.334 0a.621.621 0 0 0-.16 1.037c.189.166.178.165 2.242.165 2.063 0 2.052.001 2.242-.165a.622.622 0 0 0-.16-1.037c-.103-.047-.218-.05-2.082-.05-1.865 0-1.98.003-2.082.05M4.251 9.597c-.491.224-.498.881-.011 1.14.088.047.185.05 1.76.05 1.657 0 1.667-.001 1.773-.058.475-.256.461-.911-.024-1.132-.102-.046-.209-.049-1.749-.049s-1.647.003-1.749.049m5.334 0c-.406.185-.501.723-.181 1.02.186.173.164.17 1.263.17 1.098 0 1.076.003 1.262-.17.321-.297.226-.835-.18-1.02-.1-.045-.192-.049-1.082-.049-.891 0-.983.004-1.082.049"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGreenCard16;
