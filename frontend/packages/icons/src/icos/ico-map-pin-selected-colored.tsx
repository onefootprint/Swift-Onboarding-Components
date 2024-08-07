import type { IconProps } from '../types';
const IcoMapPinSelected = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
  return (
    <svg
      width={36}
      height={48}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={true}
    >
      <path
        d="M14.64.46c-2.291.362-5.238 1.664-7.35 3.246-1.71 1.281-3.233 2.883-4.332 4.553C1.699 10.172.477 13.369.175 15.54c-.105.746-.107 3.93-.004 4.83.339 2.977 2.056 7.167 4.436 10.83 1.907 2.934 5.579 7.576 11.286 14.265a931.747 931.747 0 0 0 1.88 2.2l.205.235.635-.715c1.501-1.692 6.389-7.528 8.084-9.655 3.859-4.841 6.173-8.404 7.498-11.55a29.556 29.556 0 0 0 1.23-3.723c.377-1.533.41-1.881.418-4.347.008-2.422.006-2.434-.391-4.02-.608-2.421-1.791-4.957-3.038-6.51-.934-1.163-2.827-3.033-3.828-3.783C26.705 2.189 23.265.685 21.463.485 20.925.425 14.999.403 14.64.46"
        fill="#4A24DB"
        fillRule="evenodd"
      />
    </svg>
  );
};
export default IcoMapPinSelected;
