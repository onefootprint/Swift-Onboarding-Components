import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagZw = ({ style }: FlagProps) => (
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
        fill="#F7FCFF"
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
          d="M0 1.25v12.5h20V1.25H0z"
          fill="#FECA00"
        />
        <Path
          d="M0 5.156h-1.094v4.688h22.188V5.156H0z"
          fill="#272727"
          stroke="#E31D1C"
          strokeWidth={2.188}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 2.5V0h20v2.5H0zM0 15v-2.5h20V15H0z"
          fill="#5EAA22"
        />
      </G>
      <Path
        d="m.373-.501-.998-.743v17.47l.992-.72L10.574 8.1l.689-.5-.683-.507L.373-.501z"
        fill="#F7FCFF"
        stroke="#272727"
        strokeWidth={1.25}
      />
      <Mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={-2}
        y={-3}
        width={15}
        height={21}
      >
        <Path
          d="m.373-.501-.998-.743v17.47l.992-.72L10.574 8.1l.689-.5-.683-.507L.373-.501z"
          fill="#fff"
          stroke="#fff"
          strokeWidth={1.25}
        />
      </Mask>
      <G mask="url(#prefix__c)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M4.674 8.924 2.312 10.83l1.084-2.547L1.534 6.49h2.197l.902-2.162.958 2.162h2.193l-1.96 1.793.981 2.547-2.131-1.906z"
          fill="#E31D1C"
        />
        <Path
          d="M3.136 5.263s-.034-.082.168-.155.264-.228.423-.114c.159.114.258-.115.303.213.046.329.171.847.171.847l2.055 1.544H5.87s-.601.884-.502 1.658c0 0-.415-.063-.977-.063s-.93.135-.93.135l-.325-1.202s.118-.202.168-.365c.05-.163.26-.193.26-.322 0-.13-.207-.238-.103-.574.103-.335.103-1.338.103-1.338s-.326-.143-.26-.143.218-.12.109-.12h-.277z"
          fill="#FECA00"
        />
      </G>
    </G>
  </Svg>
);
export default FlagZw;
