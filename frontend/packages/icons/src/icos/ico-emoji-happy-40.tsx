import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmojiHappy40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M18.467 3.408c-6.408.566-12.076 4.987-14.188 11.066-.671 1.929-.91 3.381-.91 5.526 0 1.73.082 2.465.439 3.926.737 3.02 2.208 5.628 4.423 7.843 2.586 2.586 5.748 4.175 9.436 4.742 1.074.166 3.592.166 4.666 0 3.685-.566 6.852-2.158 9.436-4.742 2.212-2.212 3.687-4.827 4.423-7.843.355-1.454.437-2.195.437-3.926 0-1.731-.082-2.472-.437-3.926-1.96-8.032-9.467-13.397-17.725-12.666m2.757 3.327a13.218 13.218 0 0 1 8.033 3.691 13.343 13.343 0 0 1 3.403 13.736 13.632 13.632 0 0 1-2.405 4.338c-1.275 1.525-2.717 2.655-4.469 3.501a13.246 13.246 0 0 1-11.572 0c-1.752-.846-3.194-1.976-4.469-3.501-2.908-3.476-3.829-8.326-2.405-12.662a13.503 13.503 0 0 1 3.403-5.412c2.811-2.714 6.623-4.056 10.481-3.691m-6.377 6.694c-.882.315-1.416 1.105-1.496 2.214-.101 1.399.733 2.565 1.911 2.672 1.654.15 2.763-1.94 1.968-3.709-.434-.969-1.496-1.493-2.383-1.177m9.147.004c-.346.111-.865.538-1.09.895-.321.51-.466 1.261-.373 1.921.229 1.624 1.675 2.531 2.938 1.843 1.598-.87 1.596-3.649-.003-4.519a1.991 1.991 0 0 0-1.472-.14m-9.45 9.808a1.714 1.714 0 0 0-.878 1.095c-.157.653.048 1.175.698 1.782 1.09 1.018 2.471 1.723 4.038 2.06.783.169 2.413.169 3.196 0 1.607-.346 3.011-1.072 4.079-2.111.447-.436.528-.551.626-.893.358-1.257-.793-2.394-2.074-2.049-.167.045-.482.251-.832.544-.679.567-1.235.891-1.919 1.118-.445.148-.632.17-1.445.175-.801.004-1.004-.017-1.433-.151-.719-.225-1.283-.545-1.962-1.113-.327-.274-.702-.528-.833-.564a1.772 1.772 0 0 0-1.261.107"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmojiHappy40;
