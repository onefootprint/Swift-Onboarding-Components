import type { IconProps } from '../types';
const CcDiners24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
  return (
    <svg
      width={24}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={true}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M1.23 0h21.54C23.448 0 24 .551 24 1.23v12.924c0 .68-.551 1.23-1.23 1.23H1.23A1.23 1.23 0 0 1 0 14.155V1.23C0 .55.551 0 1.23 0Z"
          fill="#0079BE"
        />
        <path
          d="M18.46 7.737c0-3.059-2.554-5.173-5.352-5.172h-2.407C7.871 2.564 5.54 4.679 5.54 7.737c0 2.798 2.33 5.097 5.161 5.083h2.407c2.798.013 5.351-2.286 5.351-5.083Z"
          fill="#fff"
        />
        <path
          d="M10.716 2.998a4.69 4.69 0 0 0-4.683 4.695 4.69 4.69 0 0 0 4.683 4.694A4.69 4.69 0 0 0 15.4 7.693a4.69 4.69 0 0 0-4.684-4.695Z"
          fill="#0079BE"
        />
        <path
          d="M7.756 7.68a2.98 2.98 0 0 1 1.906-2.777v5.553A2.979 2.979 0 0 1 7.756 7.68Zm4.03 2.778V4.903a2.979 2.979 0 0 1 1.908 2.777 2.98 2.98 0 0 1-1.907 2.777Z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h24v15.385H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default CcDiners24;
