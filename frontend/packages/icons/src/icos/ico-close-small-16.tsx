import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCloseSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.359 4.131a.77.77 0 0 0-.207.181c-.134.193-.141.499-.015.683.032.047.713.742 1.513 1.545L7.106 8 5.624 9.487c-.985.988-1.498 1.521-1.529 1.589a.768.768 0 0 0-.007.501.764.764 0 0 0 .335.335.768.768 0 0 0 .501-.007c.068-.031.605-.548 1.589-1.529L8 8.895l1.487 1.481c.984.981 1.521 1.498 1.589 1.529a.768.768 0 0 0 .501.007.764.764 0 0 0 .335-.335.768.768 0 0 0-.007-.501c-.031-.068-.548-.605-1.529-1.59L8.894 8l1.456-1.46c.8-.803 1.481-1.498 1.513-1.545a.647.647 0 0 0 .081-.206.61.61 0 0 0-.605-.735.585.585 0 0 0-.28.055c-.074.038-.611.555-1.586 1.527L8 7.106l-1.473-1.47c-.975-.972-1.512-1.489-1.586-1.527a.646.646 0 0 0-.582.022"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCloseSmall16;
