import React from 'react';

import type { FlagProps } from '../types';

const FlagBqBo = ({ className, testID }: FlagProps) => (
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
        fill="#fff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 6.833V0h10L0 6.833z"
        fill="#FEDA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 15h20.006V0L0 15z"
        fill="#00268D"
      />
      <mask id="prefix__b" fill="#fff">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m5.846 3.125.33.707a2.75 2.75 0 0 1 2.419 2.661l.597.299-.652.326A2.752 2.752 0 0 1 6.2 9.29l-.354.71-.355-.71a2.752 2.752 0 0 1-2.34-2.172L2.5 6.792l.597-.299a2.75 2.75 0 0 1 2.397-2.658l.352-.71z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.846 3.125.33.707a2.75 2.75 0 0 1 2.419 2.661l.597.299-.652.326A2.752 2.752 0 0 1 6.2 9.29l-.354.71-.355-.71a2.752 2.752 0 0 1-2.34-2.172L2.5 6.792l.597-.299a2.75 2.75 0 0 1 2.397-2.658l.352-.71z"
        fill="#fff"
      />
      <path
        d="m6.175 3.832-.453.211.117.252.277.033.06-.496zm-.33-.707.454-.211-.44-.943-.461.932.448.222zm2.75 3.368-.5.013.008.3.268.135.224-.448zm.597.299.223.447.895-.447-.895-.448-.223.448zm-.652.326-.224-.448-.217.11-.049.237.49.1zM6.2 9.29l-.063-.496-.264.034-.12.238.448.224zm-.354.71-.447.224.447.894.447-.894L5.846 10zm-.355-.71.447-.224-.12-.238-.263-.034-.064.496zM3.15 7.118l.49-.1-.048-.239-.218-.109-.223.448zm-.65-.326-.224-.448-.894.448.894.447.224-.447zm.597-.299.223.448.27-.135.007-.3-.5-.013zm2.397-2.658.063.496.266-.034.12-.24-.449-.222zm1.134-.214L6.3 2.914l-.906.422.329.707.906-.422zm2.467 2.86a3.25 3.25 0 0 0-2.86-3.145l-.12.992a2.25 2.25 0 0 1 1.98 2.178l1-.025zm.32-.137-.596-.298-.448.895.597.298.447-.895zm-.652 1.22.652-.325-.447-.895-.652.326.447.895zM6.265 9.787A3.252 3.252 0 0 0 9.03 7.218l-.98-.2a2.252 2.252 0 0 1-1.913 1.776l.128.992zm-.511-.72-.355.71.894.448.355-.71-.894-.448zm.54.71-.356-.71-.894.447.355.71.894-.447zM2.661 7.218a3.252 3.252 0 0 0 2.765 2.568l.128-.992a2.252 2.252 0 0 1-1.913-1.777l-.98.201zm-.386.02.652.327.447-.895-.651-.326-.448.895zm.597-1.192-.597.298.448.895.596-.298-.447-.895zM5.431 3.34a3.25 3.25 0 0 0-2.834 3.14l1 .025a2.25 2.25 0 0 1 1.96-2.175l-.126-.992zm-.033-.436-.352.71.896.444.352-.71-.896-.444z"
        fill="#000"
        mask="url(#prefix__b)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.86 5.188-.406.68h-.8l.4.715-.4.686h.8l.406.7.412-.7h.793l-.39-.686.39-.715h-.793l-.412-.68z"
        fill="#F00A17"
      />
    </g>
  </svg>
);

export default FlagBqBo;
