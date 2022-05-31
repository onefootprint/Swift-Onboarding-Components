import React from 'react';

import type { FlagProps } from '../src/types';

const FlagAf = ({ className, testID }: FlagProps) => (
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
        d="M14 0h6v15h-6V0z"
        fill="#67BD38"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0h8v15H6V0z"
        fill="#D51700"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h6v15H0V0z"
        fill="#272727"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m7.705 4.986.216.135c-.36.607-.602 1.163-.728 1.668a.59.59 0 0 1 .12.15c.098.17.18.334.247.494l-.287.122a3.813 3.813 0 0 0-.16-.333c-.029.246-.027.48.006.698a.586.586 0 0 1 .148.036c.184.066.352.14.506.219l-.142.278a3.968 3.968 0 0 0-.431-.19l.003.01c.134.404.338.775.614 1.115a.595.595 0 0 1 .13-.013c.196 0 .38.011.55.033l-.037.31a3.82 3.82 0 0 0-.37-.028c.247.248.538.476.873.686l-.132.222a5.033 5.033 0 0 1-1.058-.869 4.134 4.134 0 0 0-.143.06l-.022.01c.254.266.554.51.9.734l-.134.22a5.095 5.095 0 0 1-1.029-.86.678.678 0 0 1-.384-.005l.083-.3c.02.006.04.01.06.013a3.883 3.883 0 0 1-.597-1.151 2.486 2.486 0 0 1-.061-.224.666.666 0 0 1-.282-.125l.182-.254a.424.424 0 0 0 .047.03 3.56 3.56 0 0 1 .134-1.24.667.667 0 0 1-.151-.295l.265-.069c.143-.405.346-.834.607-1.286l.218.133a7.228 7.228 0 0 0-.634 1.382c.039.035.086.073.144.116.138-.504.382-1.048.729-1.632zm-.806 1.963a4.984 4.984 0 0 0-.16-.12 3.138 3.138 0 0 0-.086 1.102c.047 0 .1-.002.16-.006l.05-.003A3.035 3.035 0 0 1 6.9 6.95zm-.072 1.287.098-.005c.012.042.024.085.038.126.134.405.334.78.6 1.122l-.052.023c-.044.02-.084.036-.12.05a3.637 3.637 0 0 1-.68-1.31l.116-.006zm5.26-3.25-.216.135c.36.607.602 1.163.727 1.668a.59.59 0 0 0-.12.15 4.33 4.33 0 0 0-.246.494l.287.122a3.79 3.79 0 0 1 .16-.333c.029.246.027.48-.006.698a.586.586 0 0 0-.148.036 4.18 4.18 0 0 0-.506.219l.141.278c.131-.067.275-.13.432-.19l-.003.01a3.494 3.494 0 0 1-.614 1.115.595.595 0 0 0-.13-.013c-.196 0-.38.011-.55.033l.037.31a3.82 3.82 0 0 1 .37-.028 4.92 4.92 0 0 1-.873.686l.132.222c.414-.26.767-.55 1.058-.869l.143.06.022.01a4.97 4.97 0 0 1-.9.734l.134.22c.4-.258.744-.544 1.028-.86.136.035.25.035.385-.005l-.084-.3a.42.42 0 0 1-.06.013c.265-.352.464-.736.598-1.151a2.51 2.51 0 0 0 .06-.224.667.667 0 0 0 .282-.125l-.18-.254a.423.423 0 0 1-.049.03 3.56 3.56 0 0 0-.133-1.24.668.668 0 0 0 .15-.295l-.265-.069a7.762 7.762 0 0 0-.606-1.286l-.218.133c.285.493.496.954.634 1.382a1.893 1.893 0 0 1-.144.116c-.139-.504-.382-1.048-.73-1.632zm.806 1.963a4.821 4.821 0 0 1 .16-.12c.096.398.124.765.085 1.102-.046 0-.099-.002-.16-.006l-.05-.003c.042-.304.03-.628-.035-.973zm.072 1.287a6.322 6.322 0 0 0-.098-.005 3.745 3.745 0 0 1-.637 1.249l.05.022c.045.02.085.036.122.05a3.638 3.638 0 0 0 .679-1.31 3.261 3.261 0 0 1-.116-.006z"
        fill="#F7FCFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m8.808 10.165-.698.69s.602.369 1.736.369 1.794-.369 1.794-.369l-.53-.69s-.723.28-1.235.28c-.511 0-1.067-.28-1.067-.28z"
        fill="#F7FCFF"
      />
      <path
        d="M8.823 10.606s.59.139 1.043.139c.453 0 1.044-.14 1.044-.14"
        stroke="#C00001"
        strokeWidth={0.5}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.457 5.911c0 .274-.25.495-.557.495-.308 0-.557-.221-.557-.495 0-.273.25-.494.557-.494.308 0 .557.221.557.494zm-.557.495h-.6l-.165.127h-.033v-.99h-.304v.99h-.266v.169h.266v1.786c-.036.285-.12.446-.236.502l-.62.298h3.735l-.268-.268c-.236-.236-.349-.417-.349-.522V6.702h.107v-.17h-.107v-.99h-.304v.99h-.098l-.196-.126H9.9zm-.798.296h1.654v1.796c0 .145.069.302.202.478H8.977a1.44 1.44 0 0 0 .125-.469V6.702zm.849.798h-.66v1.302h1.319L9.95 7.5zm.68-3.652.001.001-.001-.001zm.963.338v.006-.006zm.187.023.001-.003v.003zm-.757.384h.004-.004z"
        fill="#F7FCFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m8.02 6.668-.124.09.128.188c-.11.04-.286.14-.286.374 0 .34-.12.62-.12.62l.357.23s.038-.398.135-.624a.365.365 0 0 1 .189-.198l.555.816.125-.09-.958-1.406zm3.8 0 .124.09-.128.188c.11.04.286.14.286.374 0 .34.12.62.12.62l-.357.23s-.038-.398-.135-.624a.365.365 0 0 0-.189-.198l-.555.816-.125-.09.958-1.406z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);

export default FlagAf;
