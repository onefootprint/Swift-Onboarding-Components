import React from 'react';

import type { FlagProps } from '../types';

const FlagNu = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
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
        fill="#2E42A5"
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
          d="M0 10v5h20v-5H0z"
          fill="#FECA00"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={20}
          height={10}
        >
          <path fill="#fff" d="M0 0h20v10H0z" />
        </mask>
        <g mask="url(#prefix__c)">
          <path
            d="m-1.414 9.456 3.964.917 8.451-4.67.894-.522L19.922.983l1.902-1.325-4.35-.401-7.013 3.956-5.069 2.49-6.806 3.753z"
            fill="#fff"
          />
          <path
            d="m-1.066 10.012 2.135.7L21.03-.508h-2.997l-19.1 10.52z"
            fill="#F50100"
          />
          <path
            d="m21.482 9.207.157.943-4.19.223-6.753-3.956-.637.218L-2.55.257 2.657-.745l6.96 3.844L15.06 5.73l6.422 3.477z"
            fill="#fff"
          />
          <path
            d="m21.496 9.773-2.134.7-8.5-4.804-2.52-.537L-2.037-.336H.96l10.373 5.339 2.755.643 7.408 4.127z"
            fill="#F50100"
          />
          <path
            d="M8.243-.781v-.781h-.781v.78h.781zm0 3.75v.781h.781v-.781h-.78zm-9.024 0v-.781h-.781v.78h.78zm0 4.062h-.781v.782h.78V7.03zm9.024 0h.781V6.25h-.78v.781zm0 5h-.781v.781h.781v-.78zm3.556 0v.781h.78v-.78h-.78zm0-5V6.25h-.782v.781h.782zm8.982 0v.782h.782V7.03h-.782zm0-4.062h.782v-.781h-.782v.78zm-8.982 0h-.782v.781h.782v-.781zm0-3.75h.78v-.781h-.78v.78zm-1.563 3.75v.781h.781v-.781h-.781zm0-2.188h.781V0h-.781v.781zm-.43 0V0h-.782v.781h.782zm0 2.188h-.782v.781h.782v-.781zm.43 1.562h.781V3.75h-.781v.781zm-.43 0V3.75h-.782v.781h.782zm.43.938v.781h.781v-.781h-.781zm-.43 0h-.782v.781h.782v-.781zM8.243 4.53h.781v-.78h-.78v.781zm-7.462 0v-.78H0v.781h.781zm0 .938H0v.781h.781v-.781zm7.462 0v.781h.781v-.781h-.78zM9.806 7.03v-.78h-.782v.781h.782zm0 3.438h-.782v.781h.782v-.781zm.43 0v.781h.781v-.781h-.781zm0-3.438h.781v-.78h-.781v.781zm1.563-2.5v-.78h-.782v.781h.782zm0 .938h-.782v.781h.782v-.781zm7.42-.938H20v-.78h-.781v.781zm0 .938v.781H20v-.781h-.781zM8.243 0h.781v-1.563h-.78V0zm.781 0v-.781H7.462V0h1.562zm0 2.969V0H7.462v2.969h1.562zM0 3.75h8.243V2.187H0V3.75zm-.781 0H0V2.187h-.781V3.75zm.781 0v-.781h-1.563v.781H0zm0 2.5v-2.5h-1.563v2.5H0zm0 .781V6.25h-1.563v.781H0zm0-.781h-.781v1.563H0V6.25zm8.243 0H0v1.563h8.243V6.25zm.781 5V7.031H7.462v4.219h1.562zm0 .781v-.781H7.462v.781h1.562zm0-.781h-.78v1.563h.78V11.25zm1.993 0H9.024v1.563h1.993V11.25zm.782 0h-.782v1.563h.782V11.25zm-.782 0v.781h1.563v-.781h-1.563zm0-4.219v4.219h1.563V7.031h-1.563zM20 6.25h-8.201v1.563H20V6.25zm.781 0H20v1.563h.781V6.25zm-.781 0v.781h1.563V6.25H20zm0-2.5v2.5h1.563v-2.5H20zm0-.781v.781h1.563v-.781H20zm0 .781h.781V2.187H20V3.75zm-8.201 0H20V2.187h-8.201V3.75zM11.017 0v2.969h1.563V0h-1.563zm0-.781V0h1.563v-.781h-1.563zm0 .781h.782v-1.563h-.782V0zM9.024 0h1.993v-1.563H9.024V0zm1.993 2.969V.78H9.455v2.19h1.562zM10.236 0h-.43v1.563h.43V0zM9.024.781V2.97h1.563V.78H9.024zm.782 2.969h.43V2.187h-.43V3.75zm.43 0h-.43v1.563h.43V3.75zm.781 1.719V4.53H9.455v.938h1.562zm-1.211.781h.43V4.687h-.43V6.25zm-.782-1.719v.938h1.563V4.53H9.024zm-.78-.781H.78v1.563h7.462V3.75zM0 4.531v.938h1.563V4.53H0zM.781 6.25h7.462V4.687H.781V6.25zm8.243-.781V4.53H7.462v.938h1.562zm0 1.562v3.438h1.563V7.03H9.024zm.782 4.219h.43V9.687h-.43v1.563zm1.211-.781V7.03H9.455v3.438h1.562zm-.781-4.219h-.43v1.563h.43V6.25zm.781-1.719v.938h1.563V4.53h-1.563zm8.202-.781h-7.42v1.563h7.42V3.75zM20 5.469V4.53h-1.563v.938H20zm-8.201.781h7.42V4.687h-7.42V6.25z"
            fill="#fff"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.058-.833H8.942V3.75H0v2.5h8.942v5.833h2.116V6.25H21.25v-2.5H11.058V-.833z"
            fill="#F50100"
          />
        </g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.031 6.625a1.719 1.719 0 1 0 0-3.437 1.719 1.719 0 0 0 0 3.437z"
          fill="#2E42A5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m10.063 5.432-.812.565.287-.946-.788-.597.988-.02.325-.934.324.933.988.02-.787.598.286.946-.812-.565zM4.438 5.36l-.676.47L4 5.042l-.656-.497.823-.017.27-.778.27.778.824.017-.656.497.238.788-.676-.47zm11.25 0-.677.47.239-.788-.656-.497.823-.017.27-.778.27.778.824.017-.656.497.238.788-.675-.47zm-5.625-3-.676.47.238-.788-.656-.497.823-.017.27-.778.27.778.824.017-.656.497.239.788-.677-.47zm0 6.625-.676.47.238-.788-.656-.497.823-.017.27-.778.27.778.824.017-.656.497.239.788-.677-.47z"
          fill="#FECA00"
        />
      </g>
    </g>
  </svg>
);

export default FlagNu;
