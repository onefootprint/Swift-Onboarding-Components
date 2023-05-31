import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagNz = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <G mask="url(#prefix__NZ_-_New_Zealand_(Aotearoa)__a)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15h20V0H0z"
        fill="#2E42A5"
      />
      <G mask="url(#prefix__NZ_-_New_Zealand_(Aotearoa)__b)">
        <Path fill="#2E42A5" d="M0 0h11v9H0z" />
        <G mask="url(#prefix__NZ_-_New_Zealand_(Aotearoa)__c)">
          <Path
            d="M-1.253 8.125 1.223 9.21l10.083-8.03 1.306-1.614-2.647-.363-4.113 3.46-3.31 2.332-3.795 3.129z"
            fill="#F7FCFF"
          />
          <Path
            d="m-.914 8.886 1.261.63L12.143-.583h-1.77L-.915 8.886z"
            fill="#F50100"
          />
          <Path
            d="M12.503 8.125 10.306 9.52-.056 1.18-1.362-.434l2.647-.363 4.113 3.46 3.31 2.332 3.795 3.129z"
            fill="#F7FCFF"
          />
          <Path
            d="m12.418 8.67-1.261.63-5.023-4.323-1.489-.483-6.133-4.921H.283l6.13 4.804 1.628.58 4.377 3.714z"
            fill="#F50100"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
            fill="#F50100"
          />
          <Path
            d="M5 0v-.938h-.938V0H5zm1 0h.938v-.938H6V0zM5 4v.938h.938V4H5zM0 4v-.938h-.938V4H0zm0 1h-.938v.938H0V5zm5 0h.938v-.938H5V5zm0 4h-.938v.938H5V9zm1 0v.938h.938V9H6zm0-4v-.938h-.938V5H6zm5 0v.938h.938V5H11zm0-1h.938v-.938H11V4zM6 4h-.938v.938H6V4zM5 .937h1V-.938H5V.938zM5.938 4V0H4.063v4h1.875zM0 4.938h5V3.063H0v1.874zM.938 5V4H-.938v1H.938zM5 4.062H0v1.875h5V4.063zM5.938 9V5H4.063v4h1.875zM6 8.062H5v1.876h1V8.062zM5.062 5v4h1.875V5H5.063zM11 4.062H6v1.875h5V4.063zM10.062 4v1h1.876V4h-1.876zM6 4.938h5V3.063H6v1.874zM5.062 0v4h1.875V0H5.063z"
            fill="#F7FCFF"
            mask="url(#prefix__NZ_-_New_Zealand_(Aotearoa)__d)"
          />
        </G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m15.533 12.813-1.102.579.21-1.227-.891-.87 1.232-.178.551-1.117.551 1.117 1.233.179-.892.869.21 1.227-1.102-.58zM13.25 8.669l-.85.446.162-.946-.687-.67.95-.138.425-.861.425.86.95.139-.688.67.163.946-.85-.446zm4.373-.003-.848.447.162-.946-.687-.67.949-.137.424-.86.425.86.949.138-.687.67.162.945-.849-.447zM15.75 5.169l-.85.446.162-.946-.687-.67.95-.138L15.75 3l.425.86.95.139-.688.67.163.946-.85-.446z"
          fill="#F50100"
          stroke="#F7FCFF"
          strokeWidth={0.5}
        />
      </G>
    </G>
  </Svg>
);
export default FlagNz;
