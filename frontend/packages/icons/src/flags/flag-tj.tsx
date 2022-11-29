import React from 'react';

import type { FlagProps } from '../types';

const FlagTj = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <path d="M0 0h20v15H0V0z" fill="#F7FCFF" />
      <path d="M0 0v5h20V0H0z" fill="#C51918" />
      <path d="M0 10v5h20v-5H0z" fill="#409100" />
      <path
        d="m10.013 5.394-.37.26.13-.437-.358-.276.45-.01.148-.431.147.432.45.009-.358.276.13.438-.37-.261zm-1.561.383-.37.26.13-.437-.358-.276.45-.01.148-.431.148.432.45.009-.359.276.13.438-.37-.261zm-1.583 1.41.369-.261.37.26-.13-.437.358-.276-.45-.01-.148-.431-.148.432-.45.009.359.276-.13.438zm-.021 1.228-.37.261.13-.438-.358-.276.45-.009.148-.432.148.432.45.01-.359.275.13.438-.37-.261zm5.917.261.369-.261.37.261-.13-.438.358-.276-.45-.009-.148-.432-.148.432-.45.01.359.275-.13.438zm-.108-1.75-.37.26.131-.437-.359-.276.45-.01.148-.431.148.432.45.009-.359.276.13.438-.369-.261zm-1.565-.888.37-.261.369.26-.13-.437.358-.276-.45-.01-.148-.431-.147.432-.45.009.358.276-.13.438zm-3.175 4.434-.115-.41c.637-.173 1.37-.259 2.196-.259.826 0 1.558.086 2.196.258l-.116.41c-.597-.161-1.29-.242-2.08-.242s-1.483.08-2.08.243zm.79-.658c-.255.043-.463-.203-.463-.203l.253-.104c-.008-.175.097-.284.097-.284.085.04.202.255.202.255h.229s-.064.293-.318.336zm3.006-.16s-.208.245-.463.202c-.254-.043-.318-.336-.318-.336h.229s.116-.215.202-.254c0 0 .105.108.097.283l.253.105zm-1.747.082c-.258.007-.43-.265-.43-.265l.265-.068a.4.4 0 0 1 .136-.267c.079.05.164.28.164.28l.227.031s-.104.281-.362.289z"
        fill="#FB0"
      />
      <path
        d="M9.974 8.562s-.293.67-.755.722c-.461.052-.696-.381-.696-.381s-.03.45-.578.624c-.549.174-.837-.52-.837-.52s.285.255.728.144c.443-.111.617-.522.617-.522s.328.428.766.214c.439-.214.681-.476.681-.727v-.751s-.113-.195-.31-.195c-.195 0-.25.138-.25.138s-.077-.781.629-.83v-.002l.02.001h.019v.001c.706.049.629.83.629.83s-.055-.138-.25-.138c-.197 0-.31.195-.31.195v.75c0 .252.242.514.68.728.439.214.767-.214.767-.214s.174.41.617.522c.443.111.728-.144.728-.144s-.288.694-.837.52c-.548-.173-.578-.624-.578-.624s-.235.433-.696.381c-.462-.052-.755-.722-.755-.722l-.015-.886-.014.886zm-.006-1.873a.385.385 0 0 0-.392.275c.287 0 .392.125.392.125s.212-.125.425-.125c0 0-.1-.275-.425-.275z"
        fill="#FB0"
      />
    </g>
  </svg>
);
export default FlagTj;
