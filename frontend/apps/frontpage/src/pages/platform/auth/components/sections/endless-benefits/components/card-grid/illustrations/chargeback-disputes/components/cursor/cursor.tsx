type CursorProps = {
  className?: string;
};

const Cursor = ({ className }: CursorProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="43" viewBox="0 0 38 43" fill="none" className={className}>
    <g filter="url(#filter0_d_4787_3636)">
      <path d="M8.43994 8.4502L29.0139 22.2842L17.6939 24.4787L10.1335 33.1847L8.43994 8.4502Z" fill="#0E1438" />
      <path
        d="M8.43994 8.4502L29.0139 22.2842L17.6939 24.4787L10.1335 33.1847L8.43994 8.4502Z"
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_4787_3636"
        x="0.64638"
        y="0.6105"
        width="37.2331"
        height="41.9563"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="0.578378" />
        <feGaussianBlur stdDeviation="3.47027" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4787_3636" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4787_3636" result="shape" />
      </filter>
    </defs>
  </svg>
);

export default Cursor;
