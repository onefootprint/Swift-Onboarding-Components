import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagTk = ({ style }: FlagProps) => (
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
        fill="#2E42A5"
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
      <G mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="m2.059 6.29-.553.342.214-.575-.47-.435h.57L2.06 5l.182.622h.571l-.411.435.201.575-.543-.342zm2.501-2.5-.554.342.214-.575-.47-.435h.57l.24-.622.182.622h.572l-.412.435.201.575-.543-.342zm2.5 2.5-.554.342.214-.575-.47-.435h.57L7.06 5l.182.622h.572l-.412.435.201.575-.543-.342zm-2.5 2.5-.554.342.214-.575-.47-.435h.57l.24-.622.182.622h.572l-.412.435.201.575-.543-.342z"
          fill="#F7FCFF"
        />
        <Path
          d="M15.526 3.414c-2.552 1.261-10.938 6.927-10.938 6.927h13.97c-.14-.031-.27-.057-.393-.082-1.025-.204-1.531-.305-2.639-2.51-1.24-2.47 0-4.335 0-4.335zM4.135 11.228l-.191.475.19.522 14.222.275.394-.725-.394-.522-14.221-.025z"
          fill="#FECA00"
        />
      </G>
    </G>
  </Svg>
);
export default FlagTk;
