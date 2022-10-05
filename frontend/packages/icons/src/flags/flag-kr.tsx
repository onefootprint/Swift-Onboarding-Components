import React from 'react';

import type { FlagProps } from '../types';

const FlagKr = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__KR_-_Korea_(South)__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15h20V0H0z"
        fill="#F7FCFF"
      />
      <g mask="url(#prefix__KR_-_Korea_(South)__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 11.387c2.002 0 3.624-1.723 3.624-3.849 0-2.126-1.622-3.849-3.624-3.849s-3.624 1.723-3.624 3.85c0 2.125 1.622 3.848 3.624 3.848z"
          fill="#3D58DB"
        />
        <g mask="url(#prefix__KR_-_Korea_(South)__c)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.751 7.833s-.203-1.815-1.71-1.914c-1.507-.098-1.913 1.331-2 1.71-.087.379-.307 1.39-1.893 1.39s-1.73-2.57-1.73-2.57V3.42h7.333v4.414z"
            fill="#E31D1C"
          />
        </g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m4.562 1.283.572.517-2.65 3.095-.572-.517 2.65-3.095zm.943.837.572.517-2.555 3.05-.572-.517 2.555-3.05zm1.51 1.364-.571-.517L3.882 6.04l.572.517 2.562-3.073zm8.837-2.418-.572.515.993 1.164.572-.515-.993-1.164zm1.764 2.141-.572.516.992 1.164.572-.515-.992-1.165zm-4.223.051.571-.515.993 1.164-.572.515-.992-1.164zm2.335 1.626-.572.516.992 1.164.572-.515-.992-1.165zm-1.356-2.49.572-.515 2.762 3.363-.572.516-2.762-3.364zm1.912 6.508-.576-.517-1.001 1.168.577.518 1-1.17zm-1.682 2.057-.577-.517-1 1.168.577.518 1-1.17zm2.927-.938.577.517-1 1.169-.578-.518 1.001-1.168zm-1.023 2.621-.577-.517-1 1.169.576.517 1.001-1.169zm-1.527-1.406.577.518-1.044 1.248-.577-.518 1.044-1.248zm2.29-1.562-.576-.517-1.045 1.248.577.517 1.044-1.248zM4.004 9.306l.572-.516 2.553 2.926-.572.515-2.553-2.925zm.596 2.559.572-.516 1.078 1.185-.572.515L4.6 11.865zm-1.907-1.433-.572.516 2.567 2.964.572-.516-2.567-2.964zm.407-.337.572-.516.935 1.096-.572.516-.935-1.096z"
          fill="#272727"
        />
      </g>
    </g>
  </svg>
);

export default FlagKr;
