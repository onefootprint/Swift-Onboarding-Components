import React from 'react';

import type { FlagProps } from '../types';

const FlagBt = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <path fill="#fff" d="M0 0h20v15H0z" />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v15H0V0z"
        fill="#FF6230"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15L20 0H0z"
        fill="#FECA00"
      />
      <g filter="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.739 10.206s-.94.856-.195.9c.745.046.606.5 1.215.003.61-.496.018.08.83-.034.813-.113 1.22-1.104 1.649-1.036.428.067.18-.09.541.338.361.43.996-.481.657.15-.338.633-.474 1.264.023 1.242.497-.023.7-.316.925-.632.226-.316 1.987.768 1.174-.316-.812-1.083-1.128.119-1.195-.445-.068-.565-.23-.858.155-.587.383.27 1.286.203.586-.474-.7-.678-.602-.858-.806-.678-.203.181-.7-.677 0-.79.7-.112 1.506.271 1.777.474.27.204 1.106-.045 1.287.361.18.407.79.475.947.723.159.248.046 1.467 1.332 1.4 1.287-.068 1.693-.723 1.152-1.242-.542-.52-.497-1.467-1.061-1.016-.565.452-1.377.384-1.377-.158s.248-.632.203-1.06c-.045-.43-.09-.25.745-.227.835.023.541 0 1.15-.293.61-.293 1.017.993 1.265.045s-.09-1.918-.767-1.535c-.678.384-.655 1.332-1.513.587-.857-.745-1.264-.361-.993-.767.27-.407-.068-.7.542-.43.61.272.429.362.948.43.519.067 3.273.406 2.663-.158-.61-.565-1.194-.473-1.284-.834-.09-.36.28-.27.823-.474.541-.203.316-1.241-.204-1.038-.519.203-.474 1.106-1.535.542-1.218.53-1.03.263-1.649-.634-.542-.43-.835-.452-1.76.045-.731.301-1.342.858-.959 1.603.384.745 1.298 2.147.802 2.238-.497.09-2.28-1.242-3.318-.542-1.039.7-1.606 1.38-1.944 2.193-.339.813-1.434 1.286-1.705 1.286-.27 0-.652.478-1.126.84z"
          fill="#fff"
        />
      </g>
    </g>
    <defs>
      <filter
        id="prefix__b"
        x={-0.743}
        y={-0.782}
        width={20.429}
        height={15.551}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={1.5} />
        <feColorMatrix values="0 0 0 0 0.866667 0 0 0 0 0.184314 0 0 0 0 0 0 0 0 0.38 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);

export default FlagBt;
