import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagKn = ({ style }: FlagProps) => (
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
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15L20 0H0z"
        fill="#5EAA22"
      />
      <Path
        d="m.397 17.47.453.504.563-.376L24.076 2.471l.75-.5-.602-.671-3.326-3.71-.452-.504-.563.376L-2.78 12.589l-.75.5.602.671 3.325 3.71z"
        fill="#272727"
        stroke="#FFD018"
        strokeWidth={1.563}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m7.555 10.574-.68 1.184-.434-1.334-1.352-.43 1.126-.687L6.08 7.91l1.11.855 1.152-.638-.323 1.421.924 1.063-1.388-.038zm6.25-4.096-.68 1.184-.434-1.334-1.352-.43 1.126-.687-.135-1.395 1.11.854 1.152-.638-.323 1.421.924 1.063-1.388-.038z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagKn;
