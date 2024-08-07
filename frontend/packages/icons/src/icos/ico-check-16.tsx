import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheck16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.04 1.892a.556.556 0 0 0-.31.171c-.05.052-1.83 2.44-3.957 5.307-2.126 2.868-3.88 5.21-3.896 5.204-.016-.005-.857-.692-1.869-1.527-1.134-.936-1.882-1.535-1.951-1.562a.636.636 0 0 0-.417-.016c-.156.043-.368.268-.41.437a.623.623 0 0 0 .188.617c.188.177 4.242 3.506 4.314 3.543a.634.634 0 0 0 .674-.099c.109-.098 8.237-11.041 8.324-11.207a.65.65 0 0 0-.003-.537.721.721 0 0 0-.297-.287.724.724 0 0 0-.39-.044"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheck16;
