import React from 'react';

import type { FlagProps } from '../types';

const FlagDm = ({ className, testID }: FlagProps) => (
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
        d="M0 0v15h20V0H0z"
        fill="#279E19"
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path
          d="M10 0h1.25v8.75H20V10h-8.75v5H10v-5H0V8.75h10V0z"
          fill="#F7FCFF"
        />
        <path
          d="M8.75 0H10v7.5h10v1.25H10V15H8.75V8.75H0V7.5h8.75V0z"
          fill="#272727"
        />
        <path
          d="M7.5 0h1.25v6.25H20V7.5H8.75V15H7.5V7.5H0V6.25h7.5V0z"
          fill="#FECA00"
        />
        <path d="M10 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="#C51918" />
        <path
          d="M9.204 5.258s.237-.77.789-.372c.865.426 1.15.915 1.484 1.47.334.554-.819.148-1.034-.164-.215-.312-1.408-.413-1.24-.674.17-.26 0-.26 0-.26z"
          fill="#804BFF"
        />
        <path
          d="M9.008 9.203s-.587.804 0 .804 2.969-.173 2.683-.402c-.285-.229-2.4 0-2.4 0l-.283-.402z"
          fill="#A95601"
        />
        <path
          d="M9.886 9.178c-.06-.069-1.13-2.497-.633-3.002.497-.504.789-.208.789.55 0 .756.03 2.64-.156 2.452z"
          fill="#804BFF"
        />
        <path
          d="M9.823 8.784s-.061.59.242 1.28c.304.688.917.675.917.111 0-.564.447-.035.619.342.172.376-.273-3.343-.905-4.174-.63-.832-1.24-.886-1.056-.348.183.537.183 2.789.183 2.789z"
          fill="#279E19"
        />
        <path
          d="M9.455 4.75s-.268.171-.268.643.633-.146.633-.146l-.365-.497zm.056-.18.552-.289.55.29-.105-.614.446-.434-.616-.09-.275-.558-.276.558-.616.09.446.434-.106.614zm0 7.376.552-.29.55.29-.105-.614.446-.434-.616-.09-.275-.558-.276.558-.616.09.446.434-.106.614zm4.052-3.79-.552.29.106-.614-.446-.434.616-.09.275-.558.276.558.616.09-.446.434.106.614-.552-.29zm-7.571-.324-.106.614.552-.29.55.29-.105-.614.446-.434-.616-.09-.275-.558-.276.558-.616.09.446.434zm1.8-2.393-.174.597-.368-.502-.623.02.364-.506-.21-.586.593.19.492-.381.003.622.515.35-.592.196zm5.131 5.473.175-.597.59-.195-.514-.35-.003-.623-.492.38-.593-.189.21.586-.363.505.622-.018.368.502zm.088-5.546-.174.598-.368-.502-.623.018.364-.505-.21-.586.593.19.492-.381.003.622.514.35-.59.196zm-5.248 5.723.175-.598.591-.195-.514-.35-.003-.623-.493.38-.593-.189.21.586-.363.506.622-.02.368.503z"
          fill="#FECA00"
        />
      </g>
    </g>
  </svg>
);

export default FlagDm;
