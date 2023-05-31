import React from 'react';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagBi = ({ style }: FlagProps) => (
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
      <Rect width={20} height={15} rx={1.25} fill="#5EAA22" />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={-5}
        y={-2}
        width={30}
        height={19}
        fill="#000"
      >
        <Path fill="#fff" d="M-5-2h30v19H-5z" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 7.5 20 0H0l10 7.5zm0 0L0 15h20L10 7.5z"
        />
      </Mask>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 7.5 20 0H0l10 7.5zm0 0L0 15h20L10 7.5z"
        fill="#DD2C2B"
      />
      <Path
        d="m20 0 .938 1.25 3.75-2.813H20V0zM0 0v-1.563h-4.688l3.75 2.813L0 0zm0 15-.938-1.25-3.75 2.813H0V15zm20 0v1.563h4.688l-3.75-2.813L20 15zm-.938-16.25-10 7.5 1.876 2.5 10-7.5-1.875-2.5zM0 1.563h20v-3.125H0v3.125zM10.938 6.25l-10-7.5-1.875 2.5 10 7.5 1.874-2.5zm-1.876 0-10 7.5 1.875 2.5 10-7.5-1.874-2.5zM0 16.563h20v-3.125H0v3.124zm20.938-2.813-10-7.5-1.876 2.5 10 7.5 1.875-2.5z"
        fill="#fff"
        mask="url(#prefix__b)"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
        fill="#fff"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m10.104 6.518-.734.386.14-.818-.594-.58h.821l.367-.863.368.864h.821l-.594.58.14.817-.735-.386zm-1.753 2.5-.734.386.14-.818-.595-.58h.822l.367-.863.368.864h.821l-.594.58.14.817-.735-.386zm3.5 0-.734.386.14-.818-.595-.58h.822l.367-.863.368.864h.821l-.594.58.14.817-.735-.386z"
        fill="#DD2C2B"
      />
    </G>
  </Svg>
);
export default FlagBi;
