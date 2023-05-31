import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCi = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <G
      mask="url(#prefix__CI_-_C\xF4te_d'Ivoire_(Ivory_Coast)__a)"
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <Path d="M13.75 0H20v15h-6.25V0z" fill="#67BD38" />
      <Path d="M0 0h6.25v15H0V0z" fill="#E47E00" />
      <Path d="M6.25 0h7.5v15h-7.5V0z" fill="#F7FCFF" />
    </G>
  </Svg>
);
export default FlagCi;
