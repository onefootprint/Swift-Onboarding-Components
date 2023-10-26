import React from 'react';

type GridProps = {
  color: string;
};

const GridLogo = ({ color }: GridProps) => (
  <svg
    width="79"
    height="20"
    viewBox="0 0 79 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_3665_67237)">
      <path
        d="M10.5437 0C11.7582 0 12.922 0.216483 13.9989 0.612964V6.45594H7.00008V13.4555H1.15682C0.760242 12.3786 0.543701 11.2146 0.543701 10C0.543701 4.47715 5.02085 0 10.5437 0Z"
        fill={color}
      />
      <path
        d="M7.08887 19.3871C8.16561 19.7835 9.32937 20 10.5437 20C16.0665 20 20.5437 15.5228 20.5437 9.99995C20.5437 8.78557 20.3272 7.62172 19.9308 6.54492H14.0877V13.5435H7.08887V19.3871Z"
        fill={color}
      />
      <path
        d="M44.9126 9.59904H37.8937V11.7693H42.2765C41.6625 14.4053 39.4287 16.2369 36.4963 16.2369C33.0238 16.2369 30.5148 13.6113 30.5148 10.319C30.5148 6.92063 33.1509 4.31632 36.475 4.31632C38.55 4.31632 40.3497 5.33263 41.3978 6.87828L43.5787 5.66082C42.086 3.40586 39.4923 1.93433 36.4857 1.93433C31.7323 1.93433 28.0164 5.5973 28.0164 10.2766C28.0164 14.9559 31.7323 18.6189 36.4857 18.6189C41.2497 18.6189 44.9444 14.9559 44.9444 10.2554C44.9444 10.0225 44.9338 9.78958 44.9126 9.59904Z"
        fill={color}
      />
      <path
        d="M51.6227 9.18626V7.19595H49.3254V18.4072H51.6863V12.6586C51.6863 10.1814 53.2214 9.34503 55.5081 9.34503V7.09009C53.6237 7.14302 52.2791 8.07465 51.6227 9.18626Z"
        fill={color}
      />
      <path
        d="M60.5351 4.86683C61.3291 4.86683 62.0067 4.21045 62.0067 3.40586C62.0067 2.56953 61.3291 1.93433 60.5351 1.93433C59.7305 1.93433 59.053 2.56953 59.053 3.40586C59.053 4.21045 59.7305 4.86683 60.5351 4.86683ZM59.3388 18.4071H61.6891V7.19588H59.3388V18.4071Z"
        fill={color}
      />
      <path
        d="M71.5646 18.6294C73.3431 18.6294 74.7194 17.8989 75.6087 16.7767V18.4071H77.9698V2.146H75.6193L75.6087 8.82613C74.7194 7.69337 73.3326 6.95233 71.5646 6.95233C68.5791 6.95233 66.0278 9.49313 66.0278 12.7856C66.0278 16.0886 68.5791 18.6294 71.5646 18.6294ZM72.0834 16.5227C70.0295 16.5227 68.3781 14.9241 68.3781 12.7856C68.3781 10.6577 70.0295 9.06967 72.0834 9.06967C74.1478 9.06967 75.7675 10.6577 75.7675 12.7856C75.7675 14.9241 74.1478 16.5227 72.0834 16.5227Z"
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0_3665_67237">
        <rect
          width="77.6923"
          height="20"
          fill="white"
          transform="translate(0.543701)"
        />
      </clipPath>
    </defs>
  </svg>
);

export default GridLogo;
