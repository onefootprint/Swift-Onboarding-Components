import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagEc = ({ style }: FlagProps) => (
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
        fill="#2E42A5"
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
          d="M0 0v7.5h20V0H0z"
          fill="#FECA00"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 11.25V15h20v-3.75H0z"
          fill="#E31D1C"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.758 3.62c-.075-.17 2.82-1.029 3.036-1.029.217 0 .491.515.491.515l1.76.142s-.208-.657 0-.657 3.395 1.107 3.395 1.107-3.984.48-3.984.589c0 .108.261.701.261.701l-.736.242s.043-.716-.077-.716-.477.856-.477.856l-.35-1.083S5.833 3.79 5.758 3.62z"
          fill="#7B2900"
        />
        <Path
          d="m5.77 6.261.788.189c-.824 3.447-.062 5.1 2.284 5.254l-.053.809C5.85 12.32 4.843 10.138 5.77 6.26z"
          fill="#FECA00"
        />
        <Path
          d="m6.25 5.796.8.126c-.564 3.608-.112 5.24 1.156 5.194l.028.81c-2.025.071-2.619-2.072-1.984-6.13z"
          fill="#07138E"
        />
        <Path
          d="m7.06 5.466.8.125c-.564 3.608-.112 5.24 1.156 5.195l.028.81c-2.024.07-2.619-2.073-1.984-6.13z"
          fill="#E10001"
        />
        <Path
          d="m8.564 12.046.806-.079c.067.683.016 1.272-.157 1.766l-.764-.267c.13-.373.17-.847.115-1.42z"
          fill="#07138E"
        />
        <Path
          d="M13.437 6.355s1.292 5.808-2.687 5.708"
          stroke="#FECA00"
          strokeWidth={0.81}
        />
        <Path
          d="m13.351 5.796-.8.126c.565 3.608.113 5.24-1.155 5.194l-.028.81c2.024.071 2.618-2.072 1.983-6.13z"
          fill="#07138E"
        />
        <Path
          d="m12.541 5.466-.8.125c.565 3.608.112 5.24-1.155 5.195l-.029.81c2.025.07 2.62-2.073 1.984-6.13z"
          fill="#E10001"
        />
        <Path
          d="m10.88 12.05-.805-.087c-.068.623-.016 1.164.161 1.618l.755-.294c-.126-.323-.165-.734-.11-1.237z"
          fill="#07138E"
        />
        <Path fill="#908F89" d="M8.667 10.938h2.431v1.158H8.667z" />
        <Path
          d="M9.882 11.25c.685 0 1.277-.386 1.686-.954.409-.567.652-1.336.652-2.171 0-.835-.243-1.604-.652-2.171-.409-.568-1-.954-1.686-.954-.685 0-1.277.386-1.686.954-.409.567-.652 1.336-.652 2.171 0 .835.243 1.604.652 2.171.409.568 1 .954 1.686.954z"
          stroke="#FEE901"
          strokeWidth={0.625}
        />
        <Mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={7}
          y={4}
          width={6}
          height={8}
        >
          <Path
            d="M9.882 11.25c.685 0 1.277-.386 1.686-.954.409-.567.652-1.336.652-2.171 0-.835-.243-1.604-.652-2.171-.409-.568-1-.954-1.686-.954-.685 0-1.277.386-1.686.954-.409.567-.652 1.336-.652 2.171 0 .835.243 1.604.652 2.171.409.568 1 .954 1.686.954z"
            fill="#fff"
            stroke="#fff"
            strokeWidth={0.625}
          />
        </Mask>
        <G mask="url(#prefix__c)" fillRule="evenodd" clipRule="evenodd">
          <Path
            d="M11.349 9.628s-.985-.536-1.268-.727c-.282-.19-.119-.617-.606-.503-.486.114-.877.312-.877.856s-.383.867-.513.495c-.13-.371-.743-2.109 0-2.109s2.479.39 2.99.39c.51 0 .808.265.808.745 0 .644-.534.853-.534.853z"
            fill="#8DDD61"
          />
          <Path
            d="M9.882 6.801a.41.41 0 0 0 .405-.413.41.41 0 0 0-.405-.414.41.41 0 0 0-.405.414.41.41 0 0 0 .405.413z"
            fill="#FEE901"
          />
          <Path
            d="M8.543 6.838s.472-.114 1.123.325c.65.438 2.23.688 2.23.344v.67s-3.503-.217-3.69 0c-.188.219-.207-1.217 0-1.34.205-.121.337 0 .337 0z"
            fill="#F7FCFF"
          />
        </G>
      </G>
    </G>
  </Svg>
);
export default FlagEc;
