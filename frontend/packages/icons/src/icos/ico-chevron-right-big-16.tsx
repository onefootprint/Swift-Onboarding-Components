import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRightBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.747 2.106a.57.57 0 0 0-.268.225c-.073.097-.079.121-.079.334 0 .197.009.241.064.322.035.051 1.169 1.2 2.52 2.553L10.44 8l-2.456 2.46c-1.351 1.353-2.485 2.502-2.52 2.553-.055.081-.064.125-.064.32 0 .209.006.236.078.336a.998.998 0 0 0 .187.186c.1.072.127.078.336.078.22 0 .231-.003.36-.098.073-.054 1.25-1.218 2.615-2.587 2.22-2.225 2.492-2.506 2.565-2.655.11-.224.149-.427.132-.686a1.176 1.176 0 0 0-.246-.673c-.065-.085-1.225-1.26-2.579-2.613C6.942 2.717 6.36 2.15 6.267 2.109a.675.675 0 0 0-.52-.003"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRightBig16;
