import React from 'react';

import type { FlagProps } from '../src/types';

const FlagLi = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <path fill="#fff" d="M0 0h20v15H0z" />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15h20V0H0z"
        fill="#E31D1C"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v7.5h20V0H0z"
          fill="#2E42A5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.999 6.908s.754.47 2.502.47c1.747 0 2.675-.47 2.675-.47s-1.37-.796-2.596-.796c-1.225 0-2.58.796-2.58.796z"
          fill="#000"
        />
        <path
          d="m3.044 4.214-.216.126.072.124h5.531l.055-.175-.239-.075.239.075v-.002l.002-.004.004-.013a2.141 2.141 0 0 0 .052-.213c.03-.138.061-.33.07-.543.017-.413-.049-.98-.475-1.35-.439-.381-.99-.315-1.432-.205a8.9 8.9 0 0 0-.453.13l-.19.058c-.2.06-.356.094-.476.094a1.48 1.48 0 0 1-.427-.086A10.7 10.7 0 0 1 5 2.102a6.292 6.292 0 0 0-.406-.125c-.425-.112-.928-.157-1.484.158a1.141 1.141 0 0 0-.548.662 1.543 1.543 0 0 0-.028.734 2.662 2.662 0 0 0 .283.788l.007.014.003.004v.002h.001l.216-.125z"
          fill="#FFD83D"
          stroke="#000"
          strokeWidth={0.5}
        />
        <path
          d="m2.502 4.454-.117-.22-.193.101.075.205.72 1.98.08.221.226-.067h.003l.01-.003.037-.01.146-.04c.127-.032.31-.075.53-.118A8.526 8.526 0 0 1 5.62 6.33c.58 0 1.152.085 1.58.172a9.313 9.313 0 0 1 .655.158l.036.01.009.003h.002l.225.07.083-.22.74-1.981.078-.206-.195-.103-.117.221.117-.22-.001-.001h-.001l-.004-.003-.012-.006a3.03 3.03 0 0 0-.2-.086 5.368 5.368 0 0 0-.607-.194c-.536-.14-1.334-.277-2.4-.277-1.065 0-1.863.137-2.4.277-.267.07-.47.14-.607.194a3.034 3.034 0 0 0-.199.086l-.012.006-.004.002-.001.001.116.221zM5.546 2.76c.42 0 .67-.405.67-.779 0-.373-.25-.778-.67-.778-.42 0-.67.405-.67.778 0 .374.25.778.67.778z"
          fill="#FFD83D"
          stroke="#000"
          strokeWidth={0.5}
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={4.074}
          y={-1}
          width={3}
          height={4}
          fill="#000"
        >
          <path fill="#fff" d="M4.074-1h3v4h-3z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.704 0h-.315l.04.577-.355-.049v.397l.36-.05-.045.908h.315l-.047-.91.362.052V.528L5.664.58l.04-.58z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.704 0h-.315l.04.577-.355-.049v.397l.36-.05-.045.908h.315l-.047-.91.362.052V.528L5.664.58l.04-.58z"
          fill="#FFD83D"
        />
        <path
          d="M5.389 0v-.5h-.537l.038.535L5.389 0zm.315 0 .499.035L6.24-.5h-.536V0zm-.275.577-.067.495.61.083-.044-.613-.499.035zM5.074.528 5.14.033l-.567-.077v.572h.5zm0 .397h-.5v.573l.568-.078-.068-.495zm.36-.05.5.025.03-.603-.598.082.069.496zm-.045.908-.5-.025-.026.525h.526v-.5zm.315 0v.5h.526l-.027-.526-.5.026zm-.047-.91.07-.495-.6-.085.03.606.5-.026zm.362.052-.07.495.57.08V.925h-.5zm0-.397h.5v-.577l-.571.082.07.495zM5.664.58l-.5-.034-.042.617.613-.088L5.664.58zM5.389.5h.315v-1h-.315v1zm.539.042-.04-.577-.998.07.04.577.998-.07zm-.922.482.356.048.135-.99-.356-.05-.135.992zm.568-.1V.529h-1v.397h1zM5.366.38l-.36.05.136.99.36-.049-.136-.99zm.522 1.43L5.934.9 4.935.85l-.046.908.999.05zm-.184-.526h-.315v1h.315v-1zM5.158.899l.046.91 1-.052-.048-.91L5.158.9zm.931-.47L5.727.38l-.14.99.362.05.14-.99zm-.57.1v.396h1V.528h-1zm.216.545.355-.05-.142-.99-.355.05.142.99zm-.53-1.109-.04.58.997.069.04-.58-.997-.069z"
          fill="#000"
          mask="url(#prefix__c)"
        />
      </g>
    </g>
  </svg>
);

export default FlagLi;
