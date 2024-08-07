import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowDown24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.62 4.698a1.004 1.004 0 0 0-.26.247l-.1.149-.02 5.873-.02 5.873-1.88-1.883c-1.034-1.035-1.947-1.917-2.028-1.96-.37-.192-.837-.002-1.01.412-.073.175-.077.275-.018.491.037.137.41.528 2.59 2.715 1.4 1.405 2.626 2.606 2.724 2.67a.726.726 0 0 0 .804 0c.098-.064 1.322-1.265 2.721-2.67 2.189-2.198 2.55-2.578 2.59-2.72.062-.217.059-.308-.015-.486-.168-.401-.635-.602-.99-.425-.07.035-.988.921-2.038 1.97l-1.91 1.906v-5.804c0-4.298-.012-5.839-.046-5.94-.157-.46-.691-.663-1.094-.418"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowDown24;
