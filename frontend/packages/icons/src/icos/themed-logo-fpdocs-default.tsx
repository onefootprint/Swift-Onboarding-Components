import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const ThemedLogoFpdocsDefault = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={144}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    />
  );
};
export default ThemedLogoFpdocsDefault;
