import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBolt24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.039 2.899c-.1.032-.259.125-.355.207-.124.106-1.144 1.604-3.565 5.235-1.865 2.798-3.433 5.167-3.485 5.263-.116.22-.125.687-.018.93.112.252.404.533.65.625.209.078.302.081 2.674.081h2.457l.011 2.51.012 2.51.112.229c.341.693 1.217.89 1.788.402.118-.102 1.189-1.675 3.561-5.232 1.865-2.798 3.433-5.167 3.485-5.263.116-.22.125-.687.018-.93-.112-.252-.404-.533-.65-.625-.209-.078-.302-.081-2.674-.081h-2.457l-.011-2.51c-.012-2.455-.014-2.514-.096-2.692-.197-.426-.563-.68-1.016-.704a1.376 1.376 0 0 0-.441.045m.146 6.661c.1.214.333.454.555.574.157.085.199.086 2.55.106l2.39.02-2.88 4.32-2.88 4.32v-2.088c0-1.99-.004-2.099-.08-2.302-.09-.241-.335-.512-.58-.644-.157-.085-.201-.086-2.55-.106l-2.39-.02 2.87-4.305 2.87-4.305.02 2.125c.019 2.058.023 2.131.105 2.305"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBolt24;
