import type { IconProps } from '../types';
const IcoMapPinDefault = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
        d="M14.49 1.499c-2.044.412-4.493 1.477-6.21 2.7C6.703 5.323 4.803 7.271 3.804 8.79c-1.443 2.194-2.501 5.268-2.676 7.77-.074 1.063-.02 3.067.103 3.84.549 3.435 2.035 6.938 4.556 10.74 1.865 2.813 5.082 6.877 10.722 13.546l1.485 1.755 1.913-2.267c6.862-8.13 9.768-11.919 11.605-15.134 1.713-2.999 3.066-6.609 3.292-8.79.093-.898.093-3.44 0-4.32-.283-2.689-1.732-6.161-3.467-8.31-.503-.624-2.346-2.456-2.927-2.91-.975-.762-2.45-1.615-3.87-2.238-1.4-.614-2.452-.916-3.591-1.03-.342-.034-1.814-.06-3.27-.057-2.307.004-2.719.019-3.189.114"
        fill="#fff"
        fillRule="evenodd"
      />
    </svg>
  );
};
export default IcoMapPinDefault;
