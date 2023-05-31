import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagPf = ({ style }: FlagProps) => (
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
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v3.75h20V0H0zm0 11.25V15h20v-3.75H0z"
          fill="#BF2714"
        />
        <Mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={6}
          y={3}
          width={8}
          height={9}
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
            fill="#fff"
          />
        </Mask>
        <G mask="url(#prefix__c)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.593 8.603a.123.123 0 0 1 .179-.144l.233.136c.035.02.078.022.114.005l.577-.27a.123.123 0 0 1 .124.011l.623.45.86-.464a.123.123 0 0 1 .108-.004l.648.282c.033.014.07.013.103-.002l.581-.28a.123.123 0 0 1 .1-.004l.719.288a.123.123 0 0 0 .1-.004l.557-.276a.123.123 0 0 1 .112.001l.511.268a.12.12 0 0 0 .118-.002l.266-.15a.123.123 0 0 1 .18.138l-.056.209H6.653l-.06-.188zm-.003.741a.123.123 0 0 1 .181-.141l.213.127c.036.022.08.024.117.006l.548-.266a.123.123 0 0 1 .128.012l.597.447.827-.462a.123.123 0 0 1 .11-.005l.62.279a.123.123 0 0 0 .105-.002l.555-.277a.123.123 0 0 1 .101-.004l.688.285a.123.123 0 0 0 .103-.004l.531-.273a.123.123 0 0 1 .115.002l.486.264c.038.02.084.02.12-.002l.245-.144a.123.123 0 0 1 .181.137l-.053.206h-6.46l-.057-.185zm.123.492a.123.123 0 0 1 .181-.142l.213.128a.12.12 0 0 0 .117.005l.548-.266a.123.123 0 0 1 .128.013l.597.447.827-.462a.123.123 0 0 1 .11-.005l.62.279a.123.123 0 0 0 .105-.002l.554-.277a.123.123 0 0 1 .102-.004l.688.285a.123.123 0 0 0 .103-.004l.531-.273a.123.123 0 0 1 .115.002l.486.263a.12.12 0 0 0 .12-.002l.245-.143a.123.123 0 0 1 .181.137l-.053.206h-6.46l-.058-.185zm.738.492a.123.123 0 0 1 .181-.142l.213.128c.035.021.08.023.117.005l.548-.266a.123.123 0 0 1 .127.012l.598.447.827-.461a.123.123 0 0 1 .11-.005l.619.278a.123.123 0 0 0 .105-.002l.555-.276a.123.123 0 0 1 .102-.004l.688.285a.123.123 0 0 0 .103-.005l.53-.272a.123.123 0 0 1 .116.002l.486.263c.037.02.083.02.12-.002l.244-.143a.123.123 0 0 1 .182.137l-.053.205H7.508l-.057-.184zm-.983.615a.123.123 0 0 1 .18-.142l.213.128c.036.021.08.023.117.005l.548-.266a.123.123 0 0 1 .128.012l.597.447.827-.462a.123.123 0 0 1 .11-.004l.62.278a.123.123 0 0 0 .105-.002l.554-.277a.123.123 0 0 1 .102-.003l.688.284a.123.123 0 0 0 .103-.004l.531-.272a.123.123 0 0 1 .115.001l.486.264c.038.02.084.02.12-.002l.245-.143a.123.123 0 0 1 .181.136l-.053.206h-6.46l-.057-.184z"
            fill="#5277B9"
          />
          <Path
            d="M7.917 5.904h.625l-.014 2.47c.104.332.254.462.486.462v.625c-.528 0-.901-.324-1.097-.993V5.904zm4.225 0h-.625l.014 2.47c-.104.332-.254.462-.486.462v.625c.528 0 .9-.324 1.097-.993V5.904z"
            fill="red"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.453 4.318s-1.037-.271-1.037.416v2.164l1.209.359V5.488s-.604-.369-.604-.658c0-.288.432-.512.432-.512z"
            fill="red"
          />
          <Path
            d="m8.709 8.057.394-.504m-.035.487-.378-.507m.584.524.394-.504m-.034.487-.378-.507m.559.524.394-.504m-.034.487-.378-.507m.583.524.395-.504m-.035.487-.378-.507m.584.524.394-.504m-.034.487-.378-.507"
            stroke="#000"
            strokeWidth={0.625}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m8.409 4.434.748 1.462.092-1.462-.092-.288-.748.288zm-.375 1.247-.539-.571.54-.642 1.132 1.81v.46l-.545-.46v-.597h-.588zm-1.186.44.983.471.077-.727-.819-.7-.241.957zM7.88 7.33l-1.293-.133v-.912l1.293.498v.547zm-1.328.895L6.4 7.45l1.457.073v.702H6.552zM8.604 6.95v-.438l.546.438-.06.231-.486-.23zm5.071.499-.153.775h-1.304v-.702l1.457-.073zm-1.481-.12 1.293-.133v-.912l-1.293.498v.547zm1.032-1.207-.983.47-.076-.727.818-.7.241.957zm-1.186-.44.539-.572-.54-.642-1.132 1.81v.46l.545-.46v-.597h.588zm-.375-1.248-.748 1.462-.092-1.462.092-.288.748.288zM11.47 6.95v-.438l-.545.438.059.231.486-.23z"
            fill="#FA8F21"
          />
        </G>
      </G>
    </G>
  </Svg>
);
export default FlagPf;
