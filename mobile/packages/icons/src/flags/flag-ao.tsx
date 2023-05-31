import React from 'react';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: filter */
import type { FlagProps } from '../types';

const FlagAo = ({ style }: FlagProps) => (
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
        fill="#1D1D1D"
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
        <Path d="M0 0v7.5h20V0H0z" fill="#F50100" />
        <G filter="url(#prefix__c)">
          <Path
            d="M9.719 8.37c.484-.599.636-1.373.636-1.856 0-2.573-3.211-3.997-3.211-3.997 2.208 0 4.666 1.79 4.666 3.997 0 .935-.32 1.802-.858 2.492.984.49 1.817.874 1.817.874.309.202.395.742.192 1.052a.67.67 0 0 1-.926.192s-.79-.467-1.271-.783a20.846 20.846 0 0 0-.748-.462 3.932 3.932 0 0 1-2.203.675s-2.936-.36-2.852-1.865c0 0 .71.543 2.802.543.332 0 .625-.046.881-.128-.905-.494-1.673-.886-1.673-.886-.31-.202-1.113-1.23-.91-1.538.202-.31 1.427.04 1.736.242 0 0 .43.59 1.036.951.268.16.57.328.886.497zM8.238 6.127l-.631.42.201-.72-.463-.46.627-.025.266-.712.265.712h.626l-.462.485.232.678-.661-.378z"
            fill="#FCFF01"
          />
          <Path
            d="M9.719 8.37c.484-.599.636-1.373.636-1.856 0-2.573-3.211-3.997-3.211-3.997 2.208 0 4.666 1.79 4.666 3.997 0 .935-.32 1.802-.858 2.492.984.49 1.817.874 1.817.874.309.202.395.742.192 1.052a.67.67 0 0 1-.926.192s-.79-.467-1.271-.783a20.846 20.846 0 0 0-.748-.462 3.932 3.932 0 0 1-2.203.675s-2.936-.36-2.852-1.865c0 0 .71.543 2.802.543.332 0 .625-.046.881-.128-.905-.494-1.673-.886-1.673-.886-.31-.202-1.113-1.23-.91-1.538.202-.31 1.427.04 1.736.242 0 0 .43.59 1.036.951.268.16.57.328.886.497zM8.238 6.127l-.631.42.201-.72-.463-.46.627-.025.266-.712.265.712h.626l-.462.485.232.678-.661-.378z"
            fill="#FFEA42"
          />
        </G>
      </G>
    </G>
    <Defs />
  </Svg>
);
export default FlagAo;
