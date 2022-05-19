import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoSettings16 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
      aria-hidden="true"
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.464 0c-.83 0-1.534.613-1.648 1.437l-.084.608c-.013.092-.092.217-.27.288-.062.025-.123.05-.184.077-.175.077-.32.045-.394-.01l-.297-.223a1.664 1.664 0 0 0-2.174.155l-.181.18a1.664 1.664 0 0 0-.155 2.175l.223.297c.055.074.087.218.01.394-.027.06-.052.122-.077.184-.07.178-.196.257-.288.27l-.608.084A1.664 1.664 0 0 0-.1 7.564v.248c0 .831.613 1.535 1.437 1.648l.608.084c.092.013.217.092.288.27.025.062.05.123.077.184.077.176.045.32-.01.394l.54.405-.54-.405-.223.297c-.497.662-.43 1.59.155 2.175l.18.18a1.664 1.664 0 0 0 2.175.155l.297-.222c.074-.056.218-.088.394-.01.06.026.122.052.184.076.178.071.257.197.27.288l.084.609a1.664 1.664 0 0 0 1.648 1.436h.248c.831 0 1.535-.613 1.648-1.436l.084-.61c.013-.09.092-.216.27-.287.062-.024.123-.05.184-.077.176-.076.32-.044.394.01l.297.223c.662.497 1.59.431 2.175-.155l.18-.18a1.664 1.664 0 0 0 .155-2.175l-.222-.297c-.056-.073-.088-.218-.01-.394.026-.06.052-.122.076-.184.071-.178.197-.257.288-.27l.609-.084a1.664 1.664 0 0 0 1.436-1.648v-.248c0-.83-.613-1.534-1.436-1.648l-.61-.084c-.09-.013-.216-.092-.287-.27a5.607 5.607 0 0 0-.077-.184c-.076-.176-.044-.32.01-.394l.223-.296a1.664 1.664 0 0 0-.155-2.175l-.18-.181a1.664 1.664 0 0 0-2.175-.155l-.297.223c-.073.055-.218.087-.394.01a5.742 5.742 0 0 0-.184-.077c-.178-.07-.257-.196-.27-.288l-.084-.608A1.664 1.664 0 0 0 7.712 0h-.248Zm-.261 1.628a.264.264 0 0 1 .261-.228h.248c.132 0 .243.097.261.228l.084.609c.095.686.59 1.178 1.14 1.397l.14.058c.542.238 1.241.243 1.795-.172l.297-.223a.264.264 0 0 1 .345.025l.18.18c.093.093.104.24.025.346l-.222.296c-.416.554-.41 1.253-.173 1.796.02.046.04.092.058.139.219.55.712 1.045 1.398 1.14l.608.084c.131.018.228.13.228.261v.248a.264.264 0 0 1-.228.261l-.608.084c-.686.095-1.18.59-1.398 1.14a4.453 4.453 0 0 1-.058.14c-.238.542-.243 1.241.173 1.795l.222.297a.264.264 0 0 1-.024.345l-.181.18a.264.264 0 0 1-.345.025l-.297-.222c-.554-.416-1.253-.41-1.796-.173-.046.02-.092.04-.139.058-.55.219-1.045.712-1.14 1.397l-.084.61a.264.264 0 0 1-.261.227h-.248a.264.264 0 0 1-.261-.228l-.084-.608c-.095-.686-.59-1.18-1.14-1.398a4.453 4.453 0 0 1-.139-.058c-.543-.238-1.242-.243-1.796.173l-.297.222a.264.264 0 0 1-.344-.024l-.181-.181a.264.264 0 0 1-.025-.345l.223-.297c.415-.554.41-1.253.172-1.796a4.357 4.357 0 0 1-.058-.139c-.219-.55-.711-1.045-1.397-1.14l-.61-.084a.264.264 0 0 1-.227-.261v-.248c0-.132.097-.243.228-.261l.609-.084c.686-.095 1.178-.59 1.397-1.14l.058-.139c.238-.543.243-1.242-.172-1.796l-.223-.297a.264.264 0 0 1 .025-.344l.18-.181a.264.264 0 0 1 .345-.025l.297.223c.554.415 1.253.41 1.796.172.046-.02.092-.04.139-.058.55-.219 1.045-.711 1.14-1.397l.084-.61Zm.385 8.665a2.605 2.605 0 1 0 0-5.21 2.605 2.605 0 0 0 0 5.21Zm1.205-2.605a1.205 1.205 0 1 1-2.41 0 1.205 1.205 0 0 1 2.41 0Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IcoSettings16;
