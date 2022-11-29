import React from 'react';

import type { FlagProps } from '../types';

const FlagSx = ({ className, testID }: FlagProps) => (
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
        fill="#E31D1C"
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
          d="M0 7.5V15h20V7.5H0z"
          fill="#2E42A5"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0-1.25v17.5L12.5 7.5 0-1.25z"
        fill="#F7FCFF"
      />
      <mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={-2}
        width={13}
        height={19}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0-1.25v17.5L12.5 7.5 0-1.25z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__c)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.079 5.743c.898 0 1.626-.446 1.626-.997 0-.55-.728-.996-1.626-.996-.898 0-1.626.446-1.626.997 0 .55.728.996 1.626.996z"
          fill="#FBCD17"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.22 3.99c-.132 0-.226.086-.226.215v.014a.249.249 0 0 0-.012.072.23.23 0 0 0 .077.178.147.147 0 0 1 .005.035c-.003-.011-.016-.02-.041-.038-.035-.026-.093-.068-.181-.157-.127-.129-.223-.179-.342-.159a.555.555 0 0 0-.113.036.419.419 0 0 1-.245.008c-.319-.06-.668-.001-1.047.174l.131.284c.324-.15.609-.199.858-.151a.725.725 0 0 0 .468-.043c-.004.001-.001.003.015.019l.052.051c.036.037.073.07.111.1-.073.019-.07.032-.056.08.006.02.013.045.017.079.01.074-.006.113.007.131.015.02.064.016.222.01l.166-.013c.13-.013.277-.03.367-.045.088-.015.11-.02.148-.047l.032-.04a14.701 14.701 0 0 1 1.027-.115c.006 0 .011-.002.043-.008l.026-.012h.001l.076-.181-.08-.096c-.052-.016-.052-.016-.059-.016l-.015-.001H6.58a.798.798 0 0 1-.152-.015l-.055-.01c-.244-.045-.47-.045-.949.027l-.027-.02a2.38 2.38 0 0 1 .27-.029c.06-.003.06-.003.094-.003h.015l-.002-.313H5.22zm-.258.906.03-.007.03-.006a8.363 8.363 0 0 1-.06.013z"
          fill="#DA610A"
        />
        <path
          d="m4.953 5.363.05.008.051-.008c.62-.102 1.03-.09 1.266-.01.273.091.575.065.892-.042-.1.449-.152.873-.152 1.271 0 .455.087.822.167 1.144l.007.025c.078.316.142.577.142.877 0 .269-.089.41-.214.499-.144.102-.385.167-.742.167-.504 0-.975.136-1.41.401l-.006-.005-.007.005a2.658 2.658 0 0 0-1.41-.401c-.357 0-.598-.065-.742-.167-.125-.089-.214-.23-.214-.5 0-.3.065-.56.143-.876l.006-.025c.08-.322.168-.69.168-1.144 0-.398-.052-.822-.152-1.27.317.106.618.132.891.04.237-.079.645-.09 1.266.011z"
          fill="#56C6F5"
          stroke="#E31D1C"
          strokeWidth={0.625}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m5.49 6.39-.482-.428-.482.428h.143v.247l-.75.467v1.143h-.143v.215h2.5v-.215h-.178V7.104l-.786-.49V6.39h.178z"
          fill="#F7FCFF"
        />
        <path
          d="M4.97 10.638c.663 0 1.12-.073 1.355-.196a.316.316 0 0 1 .284-.16c.517.02.917-.198 1.231-.676.34-.517.409-1.251.187-2.215l.562-.129c.254 1.104.171 1.995-.266 2.66-.393.597-.928.916-1.58.937-.334.247-.918.356-1.773.356-.828 0-1.441-.161-1.835-.502-.893-.211-1.461-.568-1.685-1.096-.238-.563-.238-1.345-.016-2.353l.564.125c-.199.9-.199 1.57-.016 2.003.127.302.498.548 1.125.719l.583.124-.028.147c.285.167.72.256 1.308.256z"
          fill="#FBCD17"
        />
        <path
          d="m2.946 5.515.32.129-.16.332.447-.23-.035.17-.096.47.184-.535v.473l.112-.473.332.1-.332-.206.332-.101"
          stroke="#73BE4A"
          strokeWidth={0.625}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.556 6.21a.312.312 0 1 0 0-.624.312.312 0 0 0 0 .625z"
          fill="#FBCD17"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.65 6.17c-.004-.21-.028-.69-.134-.69-.108 0-.124.486-.126.694-.185.06-.324.22-.324.22h.92s-.145-.166-.335-.223z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagSx;
