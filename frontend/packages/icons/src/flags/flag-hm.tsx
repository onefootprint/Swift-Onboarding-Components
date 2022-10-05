import React from 'react';

import type { FlagProps } from '../types';

const FlagHm = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={53}
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
        d="M0 0h20v15H0V0z"
        fill="#2E42A5"
      />
      <path fill="#2E42A5" d="M0 0h11v9H0z" />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={11}
        height={9}
      >
        <path fill="#fff" d="M0 0h11v9H0z" />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          d="M-1.253 8.125 1.223 9.21l10.083-8.03 1.306-1.614-2.647-.363-4.113 3.46-3.31 2.332-3.795 3.129z"
          fill="#F7FCFF"
        />
        <path
          d="m-.914 8.886 1.261.63L12.143-.583h-1.77L-.915 8.886z"
          fill="#F50100"
        />
        <path
          d="M12.503 8.125 10.306 9.52-.056 1.18-1.362-.434l2.647-.363 4.113 3.46 3.31 2.332 3.795 3.129z"
          fill="#F7FCFF"
        />
        <path
          d="m12.418 8.67-1.261.63-5.023-4.323-1.489-.483-6.133-4.921H.283l6.13 4.804 1.628.58 4.377 3.714z"
          fill="#F50100"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={-1}
          y={-1}
          width={13}
          height={11}
          fill="#000"
        >
          <path fill="#fff" d="M-1-1h13v11H-1z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
          fill="#F50100"
        />
        <path
          d="M5 0v-.938h-.938V0H5zm1 0h.938v-.938H6V0zM5 4v.938h.938V4H5zM0 4v-.938h-.938V4H0zm0 1h-.938v.938H0V5zm5 0h.938v-.938H5V5zm0 4h-.938v.938H5V9zm1 0v.938h.938V9H6zm0-4v-.938h-.938V5H6zm5 0v.938h.938V5H11zm0-1h.938v-.938H11V4zM6 4h-.938v.938H6V4zM5 .937h1V-.938H5V.938zM5.938 4V0H4.063v4h1.875zM0 4.938h5V3.063H0v1.874zM.938 5V4H-.938v1H.938zM5 4.062H0v1.875h5V4.063zM5.938 9V5H4.063v4h1.875zM6 8.062H5v1.876h1V8.062zM5.062 5v4h1.875V5H5.063zM11 4.062H6v1.875h5V4.063zM10.062 4v1h1.876V4h-1.876zM6 4.938h5V3.063H6v1.874zM5.062 0v4h1.875V0H5.063z"
          fill="#F7FCFF"
          mask="url(#prefix__c)"
        />
      </g>
    </g>
    <path
      d="m5.92 12.278-.82.758.081-1.114-1.104-.168.922-.631-.557-.968 1.068.327.41-1.039.41 1.039 1.068-.327-.557.968.922.63-1.104.17.081 1.113-.82-.758zm7.32-3.981-.547.505.054-.743-.735-.112.614-.42-.371-.646.712.218.273-.692.273.692.712-.218-.37.645.613.421-.735.112.054.743-.547-.505zm1.28-5.334-.547.506.054-.743-.735-.112.614-.42-.371-.646.712.218.273-.693.273.693.712-.218-.37.645.613.42-.735.113.054.743-.547-.506zm3.2 2.667-.547.505.054-.742-.735-.113.614-.42-.371-.646.712.218.273-.692.273.692.712-.218-.37.646.613.42-.735.113.054.742-.547-.505zm-2.56 7.667-.547.505.054-.742-.735-.113.614-.42-.371-.646.712.218.273-.692.273.692.712-.218-.37.646.613.42-.735.113.054.742-.547-.505zM17.4 9.14l-.555.291.106-.618-.45-.438.621-.09.278-.563.278.562.62.09-.449.439.107.618-.556-.292z"
      fill="#F7FCFF"
    />
    <path d="m14.846 51.778 1.5.025" stroke="#979797" strokeWidth={2} />
  </svg>
);

export default FlagHm;
