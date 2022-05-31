import React from 'react';

import type { FlagProps } from '../src/types';

const FlagUm = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v15H0V0z"
        fill="#E31D1C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 1.25V2.5h20V1.25H0zm0 2.5V5h20V3.75H0zM0 7.5V6.25h20V7.5H0zm0 1.25V10h20V8.75H0zm0 3.75v-1.25h20v1.25H0zM0 15v-1.25h20V15H0z"
        fill="#F7FCFF"
      />
      <path fill="#2E42A5" d="M0 0h11.25v8.75H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m1.3 2.717.662-.461.514.37h-.29l.588.52-.2.73h-.31l-.303-.67-.257.67H.935l.589.52-.224.821.662-.461.514.37h-.29l.588.52-.2.73h-.31l-.303-.67-.257.67H.935l.589.52-.224.821.662-.461.641.461-.199-.82.515-.521H2.68l.531-.37.514.37h-.29l.588.52-.224.821.662-.461.641.461-.199-.82.515-.521H5.18l.531-.37.514.37h-.29l.588.52-.224.821.662-.461.641.461-.199-.82.515-.521H7.68l.531-.37.514.37h-.29l.588.52-.224.821.662-.461.641.461-.199-.82.515-.521h-.655l-.303-.67-.257.67H8.83l-.177-.73.515-.52H8.93l.531-.37.641.461-.199-.82.515-.521h-.655l-.303-.67-.257.67H8.83l-.177-.73.515-.52H8.93l.531-.37.641.461-.199-.82.515-.521h-.655L9.46.706l-.257.67h-.769l.589.52-.2.73h-.31l-.303-.67-.257.67H7.58l-.177-.73.515-.52h-.655L6.96.706l-.257.67h-.769l.589.52-.2.73h-.31l-.303-.67-.257.67H5.08l-.177-.73.515-.52h-.655L4.46.706l-.257.67h-.769l.589.52-.2.73h-.31l-.303-.67-.257.67H2.58l-.177-.73.515-.52h-.655L1.96.706l-.257.67H.935l.589.52-.224.821zm7.525 2.409.199-.73-.589-.52h.291l-.514-.37-.53.37h.237l-.515.52.177.73h.373l.257-.67.303.67h.31zm-1.349 0-.514-.37-.53.37h.237l-.515.52.177.73h.373l.257-.67.303.67h.31l.2-.73-.589-.52h.291zm-2.202.52-.2.73h-.31l-.303-.67-.257.67H3.83l-.177-.73.515-.52H3.93l.531-.37.514.37h-.29l.588.52zm.18-.52H5.08l-.177-.73.515-.52H5.18l.531-.37.514.37h-.29l.588.52-.2.73h-.31l-.303-.67-.257.67zm-1.63 0 .2-.73-.589-.52h.291l-.514-.37-.53.37h.237l-.515.52.177.73h.373l.257-.67.303.67h.31zm3.95-1.98-.2.73h-.31l-.303-.67-.257.67H6.33l-.177-.73.515-.52H6.43l.531-.37.514.37h-.29l.588.52zm-2.798-.52-.514-.37-.53.37h.237l-.515.52.177.73h.373l.257-.67.303.67h.31l.2-.73-.589-.52h.291z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);

export default FlagUm;
