import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagIq = ({ style }: FlagProps) => (
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
      <G mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M0 0v5h20V0H0z" fill="#BF2714" />
        <Path d="M0 10v5h20v-5H0z" fill="#272727" />
        <Path
          d="M3.335 8.007c.569.816-.21 1.368-.21 1.368s.68 0 .942-.546H9.64V7.625s-.117-.578-.613-.578-.608.578-.608.578H6.46L8.356 5.95l-.37-.326-2.106 1.86v.394h2.99v-.232s.017-.134.157-.134.106.134.106.134v.496H5.364v-.678l-.408.182v.496s-.5-.136-.816-.136c-.315 0-.334-.36-.334-.36l-.47.36zm7.57.046.305.761H9.994V5.76l.513.164v2.13h.397zm5.664 0 .306.761h-1.216V5.76l.513.164v2.13h.397zm-1.506-2.262-.317.214v2.046h-.322v-1.64l-.532.306V8.05h-.357v-.926l-.404.26v.251s-.778.054-.778 1.153h2.707l.003-2.998zM4.683 9.354c.097 0 .176-.07.176-.157 0-.086-.079-.156-.177-.156-.097 0-.177.07-.177.156 0 .087.08.157.177.157zm9.014-3.328c-.138.181-.555 0-.555 0l1.183-.137c-.122.238-.628.137-.628.137z"
          fill="#009C4E"
        />
      </G>
    </G>
  </Svg>
);
export default FlagIq;
