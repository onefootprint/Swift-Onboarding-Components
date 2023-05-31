import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagDo = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <Mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <Path fill="#fff" d="M0 0h20v15H0z" />
    </Mask>
    <G mask="url(#prefix__a)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15h20V0H0z"
        fill="#C51918"
      />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.75 0h2.5v6.25H20v2.5h-8.75V15h-2.5V8.75H0v-2.5h8.75V0z"
          fill="#F7FCFF"
        />
        <Path fill="#4257BF" d="M0 0h8.75v6.25H0zm11.25 8.75H20V15h-8.75z" />
        <Path
          d="m8.523 6.944.622.06c-.106 1.112.032 1.581.257 1.581v.625c-.778 0-1.018-.814-.879-2.266zm2.994 0-.622.06c.106 1.112-.032 1.581-.257 1.581v.625c.777 0 1.018-.814.879-2.266z"
          fill="#309404"
        />
        <Path
          fill="#003994"
          d="M9.205 6.683h.591v.923h-.591zm.909 1.096h.59v.468a.455.455 0 0 1-.454.455h-.136v-.923z"
        />
        <Path
          fill="#DE2110"
          d="M10.068 6.625h.591v.923h-.591zm-.863 1.154h.59v.923H9.66a.455.455 0 0 1-.454-.455V7.78z"
        />
        <Path
          d="m8.959 6.63-.418-.464c.441-.397.902-.604 1.375-.604.474 0 .934.207 1.376.604l-.418.465c-.335-.301-.652-.444-.958-.444-.305 0-.623.143-.957.444z"
          fill="#00319C"
        />
        <Path
          d="m9.004 9.746-.418-.464c.442-.398.902-.604 1.376-.604.474 0 .934.206 1.375.604l-.418.464c-.334-.3-.652-.443-.957-.443-.306 0-.623.142-.958.443z"
          fill="#DE2110"
        />
      </G>
    </G>
  </Svg>
);
export default FlagDo;
