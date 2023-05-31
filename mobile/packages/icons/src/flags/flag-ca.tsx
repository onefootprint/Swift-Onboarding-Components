import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCa = ({ style }: FlagProps) => (
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
    <G mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <Path d="M5 0h10v15H5V0z" fill="#F7FCFF" />
      <Path
        d="M8.956 5.252 9.983 3.75 10 12.5h-.428l.263-2.165s-2.883.529-2.644.262c.238-.267.375-.757.375-.757L5 8.092s.405-.005.734-.205c.33-.2-.33-1.385-.33-1.385l1.296.192.49-.544.978 1.045h.44l-.44-2.393.788.45zM10 12.5V3.75l1.044 1.502.788-.45-.44 2.393h.44l.977-1.045.49.544 1.296-.192s-.658 1.185-.33 1.385c.33.2.735.205.735.205L12.434 9.84s.137.49.376.757c.238.267-2.645-.262-2.645-.262l.263 2.165H10zM15 0h5v15h-5V0zM0 0h5v15H0V0z"
        fill="#E31D1C"
      />
    </G>
  </Svg>
);
export default FlagCa;
