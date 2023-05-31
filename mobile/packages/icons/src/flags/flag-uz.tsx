import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagUz = ({ style }: FlagProps) => (
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
        d="M0 10h20v5H0v-5z"
        fill="#14DC5A"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v6.25H0V0z"
        fill="#0099B5"
      />
      <Path
        d="M-1.25 5.781h-.469v4.689H21.72V5.78H-1.25z"
        fill="#F7FCFF"
        stroke="#C51918"
        strokeWidth={0.938}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m10.455 1.5-.615.349.176-.708-.589-.52h.769l.258-.67.302.67h.655l-.515.52.248.708-.69-.348zM7.306 3.423l.614-.348.69.348-.248-.708.514-.52h-.655l-.302-.67-.258.67h-.768l.588.52-.175.708zM5.61 4.721l-.614.348.176-.708-.589-.52h.769l.257-.67.303.67h.655l-.515.52.247.708-.689-.348zm2.346.002-.615.349.176-.708-.589-.52h.769l.258-.67.302.67h.655l-.515.52.248.708-.69-.349zm2.5 0-.615.349.176-.708-.589-.52h.769l.258-.67.302.67h.655l-.515.52.248.708-.69-.349zm-.65-1.3.614-.35.69.35-.248-.71.514-.52h-.655l-.302-.67-.258.67h-.768l.588.52-.175.71zm2.535 1.649.615-.349.689.349-.248-.708.515-.52h-.655l-.302-.67-.258.67h-.769l.589.52-.176.708zm.58-1.998-.615.348.175-.708-.588-.52h.768l.258-.67.302.67h.655l-.514.52.247.708-.689-.348zm-.58-1.225.614-.348.689.348-.248-.708.515-.52h-.655l-.302-.67-.258.67h-.768l.588.52-.176.708zm3.115 2.874-.615.349.176-.708-.589-.52h.769l.258-.67.302.67h.655l-.515.52.248.708-.69-.349zm-.65-1.3.614-.35.69.35-.248-.71.514-.52h-.655l-.302-.67-.258.67h-.768l.588.52-.175.71zm.649-1.922-.615.348.176-.708-.588-.52h.768l.258-.67.302.67h.655l-.515.52.248.708-.69-.348zM3.678 5.15s-1.51-.41-1.481-1.925C2.225 1.712 3.75 1.318 3.75 1.318c-.623-.236-2.466.08-2.5 1.893-.034 1.812 1.847 2.169 2.428 1.94z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagUz;
