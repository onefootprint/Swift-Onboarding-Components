import type { IconProps } from '../types';
const IcoMastercard24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
      <path d="M14.704 7.488H9.296v9.718h5.409V7.488Z" fill="#FF5F00" />
      <path
        d="M9.64 12.347A6.17 6.17 0 0 1 12 7.488a6.18 6.18 0 1 0 0 9.719 6.172 6.172 0 0 1-2.36-4.86Z"
        fill="#EB001B"
      />
      <path
        d="M22 12.347a6.18 6.18 0 0 1-10 4.86 6.182 6.182 0 0 0 0-9.719 6.18 6.18 0 0 1 10 4.86ZM21.41 16.177v-.199h.08v-.04h-.204v.04h.08v.199h.044Zm.397 0v-.24h-.063l-.072.165-.072-.165h-.063v.24h.045v-.18l.067.155h.046l.068-.156v.181h.044Z"
        fill="#F79E1B"
      />
    </svg>
  );
};
export default IcoMastercard24;
