import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSearchSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.905 6.283c-1.223.107-2.334.642-3.216 1.547a5.098 5.098 0 0 0-.763 6.073 5.131 5.131 0 0 0 2.907 2.353c.743.233 1.686.297 2.427.165.657-.118 1.444-.433 1.94-.776l.22-.153 1.1 1.091c.96.952 1.122 1.096 1.275 1.136a.749.749 0 0 0 .924-.924c-.04-.153-.184-.315-1.136-1.275l-1.091-1.1.153-.22c.344-.497.659-1.285.775-1.94a6.251 6.251 0 0 0 0-1.76c-.083-.471-.304-1.125-.504-1.497a5.396 5.396 0 0 0-2.253-2.212c-.784-.397-1.829-.59-2.758-.508m1.467 1.614a3.613 3.613 0 0 1 2.037 5.44c-.635.998-1.67 1.589-2.889 1.649-1.655.081-3.127-.98-3.627-2.614-.097-.319-.107-.412-.107-.992 0-.583.009-.672.109-.998.416-1.362 1.499-2.33 2.891-2.583.107-.019.428-.028.714-.021.413.012.592.036.872.119"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSearchSmall24;
