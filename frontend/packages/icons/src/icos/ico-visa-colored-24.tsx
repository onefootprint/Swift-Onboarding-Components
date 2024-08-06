import type { IconProps } from '../types';
const IcoVisa24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={true}
    >
      <path
        d="m11.903 8.78-1.337 6.248H8.95l1.337-6.247h1.616Zm6.799 4.034.85-2.345.49 2.345h-1.34Zm1.804 2.214H22L20.695 8.78h-1.379c-.31 0-.572.18-.688.458l-2.425 5.789H17.9l.337-.933h2.073l.196.933Zm-4.22-2.04c.008-1.648-2.278-1.74-2.263-2.476.005-.224.219-.463.685-.524.232-.03.87-.054 1.594.28l.283-1.325a4.355 4.355 0 0 0-1.512-.276c-1.597 0-2.721.848-2.73 2.065-.01.899.803 1.4 1.414 1.7.63.306.842.502.839.776-.005.419-.503.605-.967.612-.813.012-1.284-.22-1.66-.395l-.293 1.37c.378.172 1.075.323 1.797.33 1.698 0 2.809-.838 2.814-2.137ZM9.594 8.781l-2.618 6.247H5.267l-1.289-4.986c-.078-.306-.146-.42-.384-.549-.388-.21-1.03-.408-1.594-.53l.038-.182h2.75c.35 0 .666.233.746.636l.68 3.616L7.896 8.78h1.697Z"
        fill="#1434CB"
      />
    </svg>
  );
};
export default IcoVisa24;
