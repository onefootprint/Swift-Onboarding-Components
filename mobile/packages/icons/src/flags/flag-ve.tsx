import React from 'react';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagVe = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <Mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <Rect width={20} height={15} rx={1.25} fill="#fff" />
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
        <Path d="M0 0v5h20V0H0z" fill="#FECA00" />
        <Path d="M0 10v5h20v-5H0z" fill="#E31D1C" />
        <Path
          d="m7.96 7.412.615-.348.689.348-.248-.708.515-.52h-.655l-.302-.67-.258.67h-.768l.577.51h-.648l-.302-.67-.258.67H6.15l.588.521-.112.454h-.49l-.303-.67-.257.67h-.769l.588.52-.108.44H5.07l-.302-.67-.258.67h-.768l.588.52-.176.708.615-.348.689.348-.248-.708.515-.52h-.033l.14-.08.69.349-.248-.709.295-.298-.008.032.614-.348.69.348-.248-.708.511-.517.007.006-.176.708zm4.054-.027-.614-.349-.689.349.248-.708-.515-.52h.655l.302-.67.258.67h.768l-.578.51h.652l.302-.67.257.67h.769l-.588.52.112.455h.49l.303-.67.257.67h.769l-.589.52.11.44h.214l.302-.67.258.67h.768l-.588.52.175.708-.614-.349-.689.349.248-.708-.515-.52h.033l-.14-.08-.69.348.248-.708-.295-.298.008.032-.614-.349-.69.349.248-.708-.513-.519-.008.008.175.708z"
          fill="#F7FCFF"
        />
        <Path
          d="m9.896 6.584-.615.349.176-.709-.589-.52h.769l.258-.67.302.67h.655l-.515.52.248.709-.69-.349z"
          fill="#F7FCFF"
        />
      </G>
    </G>
  </Svg>
);
export default FlagVe;
