import React from 'react';

import type { FlagProps } from '../types';

const FlagOm = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
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
        d="M0 0v15h20V0H0z"
        fill="#F50101"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#5EAA22"
        />
        <path fill="#F50101" d="M0 0h7.5v15H0z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.731 1.27c.006-.056-.067-.078-.096-.029a23.922 23.922 0 0 1-1.73 2.5v-.573c-.09-.097-.375-.358-.375-.358v-.573l.515-.466-.707-.521-.745.521.563.466v.573c0 .274-.341.358-.341.358l-.063.505A23.357 23.357 0 0 1 2.11 1.267c-.03-.05-.104-.027-.095.031.069.461.276 1.483.85 2.575H2.71v-.02a.054.054 0 0 0-.054-.055H1.338a.054.054 0 0 0-.055.054v.83c0 .03.025.054.055.054h1.318c.03 0 .054-.025.054-.055v-.435h.166c.056.13.185.221.337.224.105.163.22.326.344.486-.286-.028-2.174-.189-2.174.498 0 .41.46.627 1.035.74-.58.525-1.127 1.019-1.38 1.246-.04.037-.008.1.045.087.45-.111 1.63-.455 2.752-1.22h.035a.854.854 0 0 0 .688-.323C5.7 6.915 6.991 7.346 7.552 7.5c.058.016.09-.06.04-.094A16.983 16.983 0 0 1 5.06 5.225l.028-.033c.214-.252.4-.512.563-.773.068-.04.122-.1.154-.173h.166v.435c0 .03.024.055.054.055h1.318c.03 0 .054-.025.054-.055v-.829a.054.054 0 0 0-.054-.054H6.025a.054.054 0 0 0-.036.014 7.722 7.722 0 0 0 .742-2.541zm-.76 2.603v-.025l-.013.025h.013zM3.525 4.1a.304.304 0 0 1-.306.302.304.304 0 0 1-.305-.302c0-.167.137-.303.305-.303.17 0 .306.136.306.303zm1.63 0c0 .167.137.302.306.302a.304.304 0 0 0 .306-.302.304.304 0 0 0-.306-.303.304.304 0 0 0-.305.303z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagOm;
