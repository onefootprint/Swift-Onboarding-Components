import React from 'react';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: filter */
import type { FlagProps } from '../types';

const FlagHk = ({ style }: FlagProps) => (
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
        fill="#EA1A1A"
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
        <G filter="url(#prefix__c)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.918 7.234s-3.618-3.227.7-5.107c0 0 1.256 1.385.314 2.94-.31.51-.57.875-.766 1.149-.401.56-.53.741-.248 1.018zm-5.34-2.317c-.249 4.703 4.256 2.91 4.256 2.91-.374.129-.478-.068-.8-.677a16.823 16.823 0 0 0-.685-1.199c-.97-1.538-2.771-1.034-2.771-1.034zm6.82 2.475s4.646 1.39 1.53 4.923c0 0-1.724-.723-1.53-2.531.065-.593.146-1.033.208-1.364.126-.678.167-.897-.207-1.028zm-1.22 1.084s.833 4.776-3.72 3.57c0 0-.123-1.866 1.58-2.5.56-.209.99-.332 1.314-.425.662-.19.876-.252.826-.645zm5.746-2.054c-2.847-3.751-5.128.527-5.128.527.202-.34.409-.257 1.048 0 .312.126.728.293 1.297.473 1.734.548 2.783-1 2.783-1z"
            fill="#fff"
          />
        </G>
        <Path
          d="M6.35 6.38s.91 1.432 2.4 1.432m1.163-3.406s-.817 1.507-.117 2.822m4.023-1.127s-1.907-.289-2.904.818m1.79 2.671s-.38-1.89-1.762-2.448m-2.235 3.475s1.646-1.004 1.698-2.494"
          stroke="#EA1A1A"
          strokeWidth={0.625}
        />
      </G>
    </G>
    <Defs />
  </Svg>
);
export default FlagHk;
