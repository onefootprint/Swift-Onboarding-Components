import React from 'react';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Stop,
} from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: filter */
import type { FlagProps } from '../types';

const FlagBr = ({ style }: FlagProps) => (
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
        fill="#093"
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
        <G filter="url(#prefix__c)" fillRule="evenodd" clipRule="evenodd">
          <Path
            d="M9.954 2.315 17.58 7.63l-7.73 4.977-7.47-5.08 7.574-5.212z"
            fill="#FFD221"
          />
          <Path
            d="M9.954 2.315 17.58 7.63l-7.73 4.977-7.47-5.08 7.574-5.212z"
            fill="url(#prefix__d)"
          />
        </G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 10.75a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
          fill="#2E42A5"
        />
        <Mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={6}
          y={4}
          width={8}
          height={7}
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 10.75a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
            fill="#fff"
          />
        </Mask>
        <G mask="url(#prefix__e)" fill="#F7FCFF">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m8.988 9.106-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm1.25 0-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm0 .75-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm-.625-2.625-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm0 1.25-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm-.876-.625-.14.074.028-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm-.875.5-.14.074.028-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm2.876-2.125-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.112.11.026.156-.14-.074z"
          />
          <Path d="m6.203 6.873.094-1.246c2.999.226 5.365 1.212 7.07 2.966l-.896.871c-1.478-1.52-3.557-2.386-6.268-2.59z" />
        </G>
      </G>
    </G>
    <Defs>
      <LinearGradient
        id="prefix__d"
        x1={20}
        y1={15}
        x2={20}
        y2={0}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#FFC600" />
        <Stop offset={1} stopColor="#FFDE42" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default FlagBr;
