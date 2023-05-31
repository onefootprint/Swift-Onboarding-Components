import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGt = ({ style }: FlagProps) => (
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
        d="M14 0h6v15h-6V0zM0 0h6v15H0V0z"
        fill="#58A5FF"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0h8v15H6V0z"
        fill="#fff"
      />
      <Path
        d="m7.978 10.648-.454-.43 4.804-5.08.455.43-4.805 5.08z"
        fill="#C6C6C6"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.115 5.066s-1.538.928-1.538 3.255 3.745 2.642 3.745 2.642-2.24-1.367-2.534-2.345c-.293-.979.327-3.552.327-3.552z"
        fill="#5AB92D"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.909 5.066s1.538.928 1.538 3.255-3.745 2.642-3.745 2.642 2.355-1.35 2.685-2.642c.33-1.291-.478-3.255-.478-3.255z"
        fill="#5AB92D"
      />
      <Path
        d="m9.255 4.75.622.056c-.02.226.103.455.408.702.98.793 1.507 1.782 1.094 2.906-.3.815-.707 1.504-1.222 2.063l-.46-.423c.458-.497.823-1.114 1.095-1.856.297-.807-.104-1.56-.9-2.204-.454-.367-.679-.786-.637-1.244z"
        fill="#5AB92D"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m8.859 6.13.655 1.854h-.482s-.173.585.155.585h2.017s.22-.146.11-.585c-.11-.438-.665-1.648-.665-1.648s.237-.2.237-.35c0-.149-.237-.165-.237-.165H9.152c-.19.033-.293.31-.293.31z"
        fill="#EFE298"
      />
    </G>
  </Svg>
);
export default FlagGt;
