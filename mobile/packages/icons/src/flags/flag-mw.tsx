import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagMw = ({ style }: FlagProps) => (
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
        fill="#E11C1B"
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
        <Path d="M0 0v6h20V0H0z" fill="#272727" />
        <Path d="M0 10v5h20v-5H0z" fill="#5EAA22" />
        <Path
          d="M2.501 8.666v-.001h-.006l.006.001zm.393-2.387h.064l-.098-.015.034.015zm1.83 0c.032-.063.066-.125.102-.186l-1.43-.948 1.687.55a5.12 5.12 0 0 1 .303-.384l-1.24-1.18 1.58.824a5.56 5.56 0 0 1 .364-.319L5.087 3.251l1.417 1.083c.132-.087.268-.17.408-.248l-.722-1.55 1.196 1.313c.143-.064.29-.122.438-.176l-.407-1.665.927 1.502c.15-.04.3-.075.455-.104L8.73 1.684l.616 1.64c.152-.017.306-.028.462-.034l.28-1.715.278 1.715c.156.007.31.018.461.035l.617-1.641-.068 1.724c.154.03.305.065.453.105l.929-1.505-.408 1.669c.148.054.293.112.435.176l1.2-1.317-.725 1.555c.14.078.275.16.405.248L15.09 3.25l-1.01 1.393c.126.1.246.206.36.316l1.59-.829-1.248 1.187a5.1 5.1 0 0 1 .3.38l1.698-.552-1.44.954c.035.06.068.12.1.18h-1.229c-.846-1.173-2.393-1.958-4.16-1.958-1.769 0-3.316.785-4.162 1.958H4.724zm1.876 0c.802-.827 2.06-1.36 3.476-1.36s2.675.533 3.477 1.36H6.6zm10.618 0h.064l.035-.015-.099.015zm.458 2.386h.005l-.005.001v-.001z"
          fill="#E11C1B"
        />
      </G>
    </G>
  </Svg>
);
export default FlagMw;
