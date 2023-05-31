import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagMo = ({ style }: FlagProps) => (
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
        fill="#1C9975"
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
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.014 4.284 8.992 4.9l.233-1.203-.85-.9 1.151-.049.488-1.123.487 1.123h1.149l-.848.95.255 1.202-1.043-.616zm-2.9.456-.631.381.144-.743L6.1 3.82l.712-.03.301-.695.301.695h.711l-.525.587.158.743-.645-.38zm5.749 0-.631.381.144-.743-.526-.557.712-.03.301-.695.301.695h.711l-.524.587.157.743-.645-.38zM5.48 6.007l-.508.306.116-.597-.422-.447.571-.024.242-.558.242.558h.57l-.42.47.126.598-.518-.306zm9.246 0-.507.306.115-.597-.421-.447.57-.024.242-.558.242.558h.57l-.42.47.126.598-.518-.306z"
          fill="#FECA00"
        />
        <Mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={5}
          y={3}
          width={10}
          height={11}
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 13.75a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"
            fill="#fff"
          />
        </Mask>
        <G mask="url(#prefix__c)" fill="#F7FCFF">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.926 13.165h4.149v.67h-4.15v-.67zm-1.703-1.003h7.98v.615h-7.98v-.614z"
          />
          <Path d="M7.888 11.888h-2.44v-.625h2.435c.863-.012 1.494-.259 1.915-.733l.21-.236.233.212c.562.51 1.123.757 1.691.757h2.69v.625h-2.69c-.652 0-1.282-.245-1.884-.726-.533.473-1.258.713-2.16.726z" />
        </G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.022 4.755S8.954 5.81 8.954 7.258c0 .31.049.602.125.871-.344-.763-.367-1.59-.07-2.491l-.405-.134c-.302.918-.303 1.78-.003 2.58a5.133 5.133 0 0 0-2.067-.706l-.047.423a4.7 4.7 0 0 1 1.814.6 3.36 3.36 0 0 0-.426-.14c-1.351-.344-2.678.145-2.678.145s.765 1.716 2.247 1.97c.074.012.147.022.22.03h-.012c-.706 0-1.363-.29-1.979-.877l-.293.308c.69.66 1.45.994 2.272.994.803 0 1.55-.32 2.231-.95a2.34 2.34 0 0 0 .184-.122l.026.023c-.014.024-.02.038-.02.038s.066.04.188.098c.673.521 1.515.913 2.181.913.822 0 1.582-.335 2.273-.994l-.294-.308c-.615.587-1.272.876-1.979.876-.258 0-.51-.041-.759-.125a3.24 3.24 0 0 0 1.126-.133c1.46-.447 2.069-1.797 2.069-1.797s-.777-.419-1.764-.423c.221-.057.452-.1.692-.126l-.046-.423c-.925.103-1.726.415-2.397.936.392-.863.423-1.803.091-2.81l-.404.134c.271.822.275 1.581.013 2.287.045-.209.072-.432.072-.667 0-1.527-1.113-2.503-1.113-2.503zm.47 4.467-.016.023.019-.023h-.003zm-1.033-.1.042-.038c.038.063.076.123.113.178a4.854 4.854 0 0 0-.155-.14z"
          fill="#F7FCFF"
        />
      </G>
    </G>
  </Svg>
);
export default FlagMo;
