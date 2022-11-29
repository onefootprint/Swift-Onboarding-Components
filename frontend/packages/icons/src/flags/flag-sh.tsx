import React from 'react';

import type { FlagProps } from '../types';

const FlagSh = ({ className, testID }: FlagProps) => (
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
        <path fill="#2E42A5" d="M0 0h11v9H0z" />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={11}
          height={9}
        >
          <path fill="#fff" d="M0 0h11v9H0z" />
        </mask>
        <g mask="url(#prefix__c)">
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
            id="prefix__d"
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
            mask="url(#prefix__d)"
          />
        </g>
        <path
          d="M13.774 6.02h-.25v.25c0 .27-.001.535-.003.793-.003.618-.005 1.201.01 1.736.02.76.076 1.443.221 2.016.147.575.389 1.062.798 1.402.412.343.962.51 1.669.51.72 0 1.284-.21 1.71-.598.42-.383.683-.918.846-1.527.324-1.208.275-2.8.187-4.346l-.013-.236h-5.175z"
          fill="#B7E1FF"
          stroke="#F7FCFF"
          strokeWidth={0.5}
        />
        <mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={13}
          y={5}
          width={7}
          height={8}
        >
          <path
            d="M13.774 6.02h-.25v.25c0 .27-.001.535-.003.793-.003.618-.005 1.201.01 1.736.02.76.076 1.443.221 2.016.147.575.389 1.062.798 1.402.412.343.962.51 1.669.51.72 0 1.284-.21 1.71-.598.42-.383.683-.918.846-1.527.324-1.208.275-2.8.187-4.346l-.013-.236h-5.175z"
            fill="#fff"
            stroke="#fff"
            strokeWidth={0.5}
          />
        </mask>
        <g mask="url(#prefix__e)">
          <path fill="#2E42A5" d="M15 11.25h3.75v1.25H15z" />
          <g filter="url(#prefix__f)">
            <path fill="#FDFF00" d="M12.5 5H20v3.75h-7.5z" />
          </g>
          <path
            d="M15.737 6.798a.889.889 0 0 0-.032-.172l.295.917a1.247 1.247 0 0 0-.077-.069l-.012-.01-.049-.042c-.063-.056-.094-.099-.099-.18a16.785 16.785 0 0 1-.01-.182 5.389 5.389 0 0 0-.016-.262zm-.234 1.614.056.044-.056-.044z"
            fill="#F7FCFF"
            stroke="#272727"
            strokeWidth={0.625}
          />
          <path d="M15.516 8.778h.125v2.472h-.125V8.778z" fill="#FDFF00" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.063 10.508h1.114s.01.321-.158.262c-.17-.06.017.06-.24 0-.258-.06-.485.187-.543.064-.057-.124-.281.034-.227-.146l.054-.18z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M15.083 10.477h1.083v.125h-1.083z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.217 10.04h.891s.009.258-.127.21c-.135-.047.014.048-.192 0-.206-.047-.387.15-.433.051-.046-.098-.226.028-.182-.116l.043-.144z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M15.233 10.017h.867v.125h-.867z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.054 9.528h.966s.01.257-.137.21c-.147-.048.015.047-.209 0-.223-.048-.42.15-.47.05-.05-.098-.243.029-.196-.116l.046-.144z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M15.072 9.504h.939v.125h-.939z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.133 9.098h.892s.009.321-.127.262c-.135-.06.014.06-.192 0-.206-.06-.387.186-.434.063-.046-.123-.225.035-.182-.145l.043-.18z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M15.15 9.067h.867v.125h-.867z" />
          <path d="M16.714 9.09h.125v2.472h-.125V9.09z" fill="#FDFF00" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.313 10.61h1.114s.01.257-.158.21c-.17-.048.017.047-.24 0-.258-.048-.485.149-.543.05-.057-.098-.281.028-.227-.116l.054-.144z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M16.333 10.585h1.083v.125h-1.083z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.478 10.144h.875s.009.193-.124.157c-.133-.036.013.036-.189 0s-.38.112-.426.038c-.045-.074-.221.021-.179-.087l.043-.108z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M16.494 10.125h.851v.125h-.851z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.304 9.631h.955s.009.193-.136.157c-.145-.035.015.036-.206 0-.22-.035-.415.112-.464.039-.05-.074-.242.02-.195-.088l.046-.108z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M16.321 9.613h.929v.125h-.929z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.389 9.2h.875s.009.257-.124.21c-.133-.048.013.047-.19 0-.201-.048-.38.149-.425.05-.045-.098-.221.028-.179-.116l.043-.144z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M16.405 9.175h.851V9.3h-.851z" />
          <path d="M18.431 8.787h.125v3.286h-.125V8.787z" fill="#FDFF00" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.92 10.783h1.419s.014.257-.202.21c-.215-.048.022.047-.306 0-.327-.048-.616.15-.69.05-.073-.098-.358.029-.289-.116l.069-.144z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M17.947 10.759h1.379v.125h-1.379z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.13 10.16h1.115s.01.193-.158.157c-.17-.036.017.036-.24 0-.258-.036-.485.112-.543.038-.057-.074-.281.021-.227-.087l.054-.108z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M18.151 10.144h1.083v.125h-1.083z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.017 9.334h1.114s.011.258-.158.21c-.17-.048.017.048-.24 0-.258-.048-.485.15-.542.05-.058-.098-.282.029-.228-.115l.054-.145z"
            fill="#F7FCFF"
          />
          <path fill="#212123" d="M18.038 9.31h1.083v.125h-1.083z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.116 11.054s.578.315 1.46.26c.882-.054.819.117 1.048-.126.229-.242.249-.188.534-.315.285-.127.326-.247.473-.247.148 0 1.714-.063 1.714-.063s-.143.129-.143.31.095.2 0 .364c-.096.165-.204.384-.342.448-.14.064-2.012.104-2.49.104-.477 0-1.457.053-1.57 0-.113-.053-.684-.735-.684-.735z"
            fill="#272727"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m13.823 9.804.559-.514s.024 0 .128.257c.104.257.109.609.216.52.108-.087.274-.006.344-.263.07-.257.066-.59.155-.424.089.167.036-.076.178.306s.198-.165.276.382c.078.546.144.735.144.862s.71.506.438.766c-.272.261-.195.138-.438.302-.242.164-.491.069-.144.198s.298.362.298.534c0 .172-.022.25-.298.21-.276-.038-.612.1-.679.1-.067 0-.877-.165-.877-.505 0-.34-.3-2.731-.3-2.731z"
            fill="#CE6201"
          />
        </g>
      </g>
    </g>
    <defs>
      <filter
        id="prefix__f"
        x={12.5}
        y={5}
        width={7.5}
        height={3.75}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);
export default FlagSh;
