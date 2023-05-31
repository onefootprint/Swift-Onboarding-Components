import React from 'react';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: filter */
import type { FlagProps } from '../types';

const FlagAq = ({ style }: FlagProps) => (
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
        fill="#5196ED"
      />
      <Mask
        id="prefix__c"
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
      <G
        filter="url(#prefix__b)"
        fillRule="evenodd"
        clipRule="evenodd"
        mask="url(#prefix__c)"
      >
        <Path
          d="M5.448 4.934s1.29.707 1.47.903c.18.196.467.915.915.508.448-.406.897-.09.897-.738 0-.647.67-2.15 1.64-1.773.972.376 1.77.14 1.995.291.224.151.762.899 1.18.899.419 0 .628.436.658 1.069.03.633-.135.693.254.768.388.076.538.362.344.738-.195.377-.18.211-.15.603.03.391-.388 2.7-1.674 2.927-1.285.225-2.504.105-2.175-.332.33-.437.784-.94.112-1.045-.673-.105-1.097-.195-1.77-.014-.672.18-1.374.467-1.793-.075-.418-.543-.328-.934-.672-1.19-.344-.256-.763-.211-.419-.708.344-.497.628-.311.344-.703-.284-.392-1.356-.562-1.356-.954 0-.391-.681-1.25.2-1.174z"
          fill="#fff"
        />
        <Path
          d="M5.448 4.934s1.29.707 1.47.903c.18.196.467.915.915.508.448-.406.897-.09.897-.738 0-.647.67-2.15 1.64-1.773.972.376 1.77.14 1.995.291.224.151.762.899 1.18.899.419 0 .628.436.658 1.069.03.633-.135.693.254.768.388.076.538.362.344.738-.195.377-.18.211-.15.603.03.391-.388 2.7-1.674 2.927-1.285.225-2.504.105-2.175-.332.33-.437.784-.94.112-1.045-.673-.105-1.097-.195-1.77-.014-.672.18-1.374.467-1.793-.075-.418-.543-.328-.934-.672-1.19-.344-.256-.763-.211-.419-.708.344-.497.628-.311.344-.703-.284-.392-1.356-.562-1.356-.954 0-.391-.681-1.25.2-1.174z"
          fill="#F5F8FB"
        />
      </G>
    </G>
    <Defs />
  </Svg>
);
export default FlagAq;
