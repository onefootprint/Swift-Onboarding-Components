import React from 'react';

import type { FlagProps } from '../types';

const FlagKn = ({ className, testID }: FlagProps) => (
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
        fill="#C51918"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15L20 0H0z"
        fill="#5EAA22"
      />
      <path
        d="m.397 17.47.453.504.563-.376L24.076 2.471l.75-.5-.602-.671-3.326-3.71-.452-.504-.563.376L-2.78 12.589l-.75.5.602.671 3.325 3.71z"
        fill="#272727"
        stroke="#FFD018"
        strokeWidth={1.563}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m7.555 10.574-.68 1.184-.434-1.334-1.352-.43 1.126-.687L6.08 7.91l1.11.855 1.152-.638-.323 1.421.924 1.063-1.388-.038zm6.25-4.096-.68 1.184-.434-1.334-1.352-.43 1.126-.687-.135-1.395 1.11.854 1.152-.638-.323 1.421.924 1.063-1.388-.038z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);
export default FlagKn;
