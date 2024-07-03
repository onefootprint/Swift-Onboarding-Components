import React from 'react';
import type { IconProps } from '../types';
const IcoMastercard16 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={true}
    >
      <g clipPath="url(#prefix__a)">
        <path d="M10.163 4.12H5.837v7.774h4.326V4.12Z" fill="#FF5F00" />
        <path
          d="M6.112 8.007A4.936 4.936 0 0 1 8 4.12a4.945 4.945 0 1 0 0 7.774 4.936 4.936 0 0 1-1.888-3.887Z"
          fill="#EB001B"
        />
        <path
          d="M16 8.007a4.945 4.945 0 0 1-8 3.887A4.945 4.945 0 0 0 8 4.12a4.944 4.944 0 0 1 8 3.887ZM15.528 11.07v-.158h.064v-.033h-.163v.033h.064v.159h.035Zm.318 0v-.191h-.05l-.058.132-.058-.132h-.05v.192h.035v-.145l.055.125h.036l.054-.125v.145h.036Z"
          fill="#F79E1B"
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
export default IcoMastercard16;
