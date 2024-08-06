import type { IconProps } from '../types';
const CcMir24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
  return (
    <svg
      width={24}
      height={17}
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
          d="M1.23.77h21.54C23.45.77 24 1.32 24 2v12.923c0 .68-.55 1.23-1.23 1.23H1.23c-.68 0-1.23-.55-1.23-1.23V2C0 1.32.55.77 1.23.77Z"
          fill="#fff"
        />
        <path d="M16.741 8.17v3.322h1.846V9.523h2.093a2.048 2.048 0 0 0 1.91-1.354h-5.849Z" fill="#37A72E" />
        <path
          d="M16.495 5.43c.108 1.358 1.394 2.432 2.963 2.432h3.21a2.046 2.046 0 0 0-1.994-2.43h-4.179Z"
          fill="url(#prefix__b)"
        />
        <path
          d="M13.763 7.828a.11.11 0 0 1 .098-.059c.062 0 .108.05.111.108v3.584h1.846v-6.03h-1.846a.741.741 0 0 0-.597.39l-1.468 3.151c-.003.013-.009.025-.015.037a.124.124 0 0 1-.225-.07V5.43H9.821v6.03h1.846a.744.744 0 0 0 .588-.39l1.508-3.234c-.003-.003 0-.006 0-.01ZM6.87 7.932l-1.08 3.53H4.462L3.384 7.928a.12.12 0 0 0-.12-.098.12.12 0 0 0-.12.12v3.508H1.298V5.428H3.353c.34 0 .696.264.795.587l.898 2.939c.046.148.117.144.163 0l.899-2.939a.879.879 0 0 1 .793-.587h2.056v6.03H7.11V7.949a.12.12 0 0 0-.12-.12.125.125 0 0 0-.12.104Z"
          fill="#37A72E"
        />
      </g>
      <defs>
        <linearGradient id="prefix__b" x1={16.496} y1={6.646} x2={22.704} y2={6.646} gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A0E5" />
          <stop offset={1} stopColor="#0077C3" />
        </linearGradient>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(0 .77)" d="M0 0h24v15.385H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default CcMir24;
